import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { WishlistItem } from './wishlist.entity';
import './types';
import { WishlistService } from './wishlist.service';
import { shopApiExtensions } from './api/api-extensions';
import { WishlistShopResolver } from './api/wishlist.resolver';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [WishlistService],
    entities: [WishlistItem],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [WishlistShopResolver],
    },
    configuration: config => {
        config.customFields.Customer.push({
            name: 'wishlistItems',
            type: 'relation',
            list: true,
            entity: WishlistItem,
            internal: true,
        });
        return config;
    },
    compatibility: '^2.0.0',
})
export class WishlistPlugin { }