import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { CudtomPromotionService } from './promotion.service';
import { shopApiExtensions } from './api/api-extensions';
import { PromotionShopResolver } from './api/promotion.resolver';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [CudtomPromotionService],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [PromotionShopResolver],
    },
    compatibility: '^2.0.0',
})
export class PromotionPlugin { }