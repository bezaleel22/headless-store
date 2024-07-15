import { DeepPartial, ID, ProductVariant, VendureEntity, EntityId } from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class WishlistItem extends VendureEntity {
    constructor(input?: DeepPartial<WishlistItem>) {
        super(input);
    }

    @ManyToOne(type => ProductVariant)
    productVariant: ProductVariant;

    @EntityId()
    productVariantId: ID;
}