import { WishlistItem } from './wishlist.entity';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomCustomerFields {
        wishlistItems: WishlistItem[];
    }
}