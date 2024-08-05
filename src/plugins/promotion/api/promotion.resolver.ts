import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';

import { CudtomPromotionService } from '../promotion.service';

@Resolver()
export class PromotionShopResolver {
    constructor(private promotionService: CudtomPromotionService) { }

    @Query()
    @Transaction()
    @Allow(Permission.Owner)
    promotions(@Ctx() ctx: RequestContext) {
        return this.promotionService.getPromotions(ctx);
    }

    // @Mutation()
    // @Transaction()
    // @Allow(Permission.Owner)
    // async addToWishlist(
    //     @Ctx() ctx: RequestContext,
    //     @Args() { productVariantId }: { productVariantId: string },
    // ) {
    //     return this.wishlistService.addItem(ctx, productVariantId);
    // }
}