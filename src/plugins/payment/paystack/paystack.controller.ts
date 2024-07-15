import { Body, Controller, Post } from '@nestjs/common';
import { Resolver, Mutation } from '@nestjs/graphql';
import { PaystackService } from './paystack.service';
import { Ctx, Logger, RequestContext } from '@vendure/core';
import { ChargeEvent } from './types';
import { loggerCtx } from './constants';

@Controller('payments')
export class PaystackController {
    constructor(private service: PaystackService) { }

    @Post('paystack')
    async webhook(@Body() body: ChargeEvent): Promise<void> {
        try {
            await this.service.settlePayment(body);
        } catch (error: any) {
            Logger.error(
                `Failed to process incoming webhook: ${error?.message
                }: ${JSON.stringify(body)}`,
                loggerCtx,
                error
            );
            throw error;
        }
    }
}

@Resolver()
export class PaystackResolver {
    constructor(private service: PaystackService) { }

    @Mutation()
    createPastackPaymentIntent(@Ctx() ctx: RequestContext): Promise<string> {
        return this.service.createPaymentIntent(ctx);
    }
}