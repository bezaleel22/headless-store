import {
    PluginCommonModule,
    RuntimeVendureConfig,
    VendurePlugin,
} from '@vendure/core';
import gql from 'graphql-tag';
import { PaystackController, PaystackResolver } from './paystack.controller';
import { paystackHandler } from './paystack.handler';
import { PaystackService } from './paystack.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    controllers: [PaystackController],
    providers: [PaystackService],
    shopApiExtensions: {
        schema: gql`
      extend type Mutation {
        createPastackPaymentIntent: String!
      }
    `,
        resolvers: [PaystackResolver],
    },
    compatibility: '^2.0.0',
    configuration: (config: RuntimeVendureConfig) => {
        config.paymentOptions.paymentMethodHandlers.push(paystackHandler);
        return config;
    },
})
export class PaystackPlugin { }