import { Injectable } from '@nestjs/common';
import {
    ID,
    PaginatedList,
    Promotion,
    PromotionService,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';

@Injectable()
export class CudtomPromotionService {
    constructor(
        private connection: TransactionalConnection,
        private promotionService: PromotionService,
    ) { }

    /**
     * Adds a new item to the active Customer's wishlist.
     */
    async getPromotions(ctx: RequestContext): Promise<PaginatedList<Promotion>> {
        // interface ListQueryOptions<T extends VendureEntity> {
        //     take?: number | null;
        //     skip?: number | null;
        //     sort?: NullOptionals<SortParameter<T>> | null;
        //     filter?: NullOptionals<FilterParameter<T>> | null;
        //     filterOperator?: LogicalOperator;
        // }

        return await this.promotionService.findAll(ctx, {});
    }
}