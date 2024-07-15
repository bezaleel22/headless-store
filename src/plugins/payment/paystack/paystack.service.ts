import { Injectable } from '@nestjs/common';
import {
    ActiveOrderService,
    ChannelService,
    EntityHydrator,
    ErrorResult,
    Logger,
    OrderService,
    OrderStateTransitionError,
    PaymentMethodService,
    RequestContext,
} from '@vendure/core';
import { paystackHandler } from './paystack.handler';
import { loggerCtx } from './constants';
import { ChargeEvent } from './types';
import { PaystackClient } from './paystack.client';

@Injectable()
export class PaystackService {
    constructor(
        private activeOrderService: ActiveOrderService,
        private orderService: OrderService,
        private channelService: ChannelService,
        private paymentMethodService: PaymentMethodService,
        private entityHydrator: EntityHydrator
    ) { }

    async createPaymentIntent(ctx: RequestContext): Promise<string> {
        const order = await this.activeOrderService.getOrderFromContext(ctx);
        if (!order) {
            throw Error('No active order found for session');
        }
        await this.entityHydrator.hydrate(ctx, order, {
            relations: ['lines', 'customer', 'shippingLines'],
        });
        if (!order.lines?.length) {
            throw Error('Cannot create payment intent for empty order');
        }
        if (!order.customer) {
            throw Error('Cannot create payment intent for order without customer');
        }
        if (!order.shippingLines?.length) {
            throw Error(
                'Cannot create payment intent for order without shippingMethod'
            );
        }
        const { apiKey, redirectUrl } = await this.getPaymentMethod(ctx);
        const client = new PaystackClient({ apiKey });
        const result = await client.initialize({
            email: order.customer.emailAddress,
            amount: Number(`${(order.totalWithTax / 100).toFixed(2)}`),
            currency: order.currencyCode,
            metadata: {
                firstName: order.customer.firstName,
                lastName: order.customer.lastName,
                customerId: order.customerId,
                orderCode: order.code,
                channelToken: ctx.channel.token,
            },
            callback_url: `${redirectUrl}/${order.code}`,
        });

        return result.authorization_url;
    }

    async settlePayment(
        body: ChargeEvent
    ): Promise<void> {
        if (body.event !== 'charge.success') {
            Logger.info(
                `Incoming webhook is of type ${body?.event} for order ${body?.data?.metadata?.orderCode}, not processing this event.`,
                loggerCtx
            );
            return;
        }
        if (
            !body.data?.metadata?.orderCode ||
            !body.data.metadata.channelToken ||
            !body.data.reference
        ) {
            throw Error(
                `Incoming Paystack webhook is missing metadata.orderCode, metadata.channelToken or code field: ${JSON.stringify(
                    body.data?.metadata
                )}`
            );
        }
        const orderCode = body.data.reference;
        const ctx = new RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            channel: await this.channelService.getChannelFromToken(
                body.data.metadata.channelToken
            ),
            authorizedAsOwnerOnly: false,
        });
        const { apiKey, method } = await this.getPaymentMethod(ctx);
        const client = new PaystackClient({ apiKey });
        const charge = await client.verify({ reference: body.data.reference });
        console.log(JSON.stringify(charge));
        if (charge.status == 'success') {
            Logger.error(
                `Requested charge ${body.data.reference} does not have 'confirmed_at' on Paystack. This payment will not be settled.`,
                loggerCtx
            );
            return;
        }
        const order = await this.orderService.findOneByCode(ctx, orderCode);
        if (!order) {
            throw Error(
                `Unable to find order ${orderCode}, unable to settle payment ${body.data.reference}!`
            );
        }
        if (order.state !== 'ArrangingPayment') {
            const transitionToStateResult = await this.orderService.transitionToState(
                ctx,
                order.id,
                'ArrangingPayment'
            );
            if (transitionToStateResult instanceof OrderStateTransitionError) {
                throw Error(
                    `Error transitioning order ${order.code} from ${transitionToStateResult.fromState} to ${transitionToStateResult.toState}: ${transitionToStateResult.message}`
                );
            }
        }
        const addPaymentToOrderResult = await this.orderService.addPaymentToOrder(
            ctx,
            order.id,
            {
                method: method.code,
                metadata: {
                    id: body.data.id,
                    reference: body.data.reference,
                    paid_at: body.data.paid_at,
                    channel: body.data.channel,
                    metadata: body.data.metadata,
                    amount: body.data.amount,
                },
            }
        );
        if ((addPaymentToOrderResult as ErrorResult).errorCode) {
            throw Error(
                `Error adding payment to order ${orderCode}: ${(addPaymentToOrderResult as ErrorResult).message
                }`
            );
        }
        Logger.info(`Payment for order ${orderCode} settled`, loggerCtx);
    }

    private async getPaymentMethod(ctx: RequestContext) {
        let { items } = await this.paymentMethodService.findAll(ctx);
        const method = items.find(
            (item) => item.handler.code === paystackHandler.code
        );
        if (!method) {
            throw Error(
                `No paymentMethod configured with handler ${paystackHandler.code}`
            );
        }
        const apiKey = method.handler.args.find((arg) => arg.name === 'apiKey');
        const redirectUrl = method.handler.args.find(
            (arg) => arg.name === 'redirectUrl'
        );
        if (!apiKey || !redirectUrl) {
            Logger.error(
                `CreatePaymentIntent failed, because no apiKey or redirect is configured for ${method.code}`,
                loggerCtx
            );
            throw Error(
                `Paymentmethod ${method.code} has no apiKey, sharedSecret or redirectUrl configured`
            );
        }
        return {
            apiKey: apiKey.value,
            redirectUrl: redirectUrl.value.endsWith('/')
                ? redirectUrl.value.slice(0, -1)
                : redirectUrl.value, // remove appending slash
            method,
        };
    }
}