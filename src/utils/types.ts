import { CollectionDefinition, CountryDefinition, LanguageCode, RoleDefinition } from '@vendure/core';
import { ConfigurableOperationInput } from '@vendure/common/lib/generated-types';

export interface InitialData {
    defaultLanguage: LanguageCode;
    defaultZone: string;
    roles?: RoleDefinition[];
    countries: CountryDefinition[];
    taxRates: Array<{
        name: string;
        percentage: number;
    }>;
    shippingMethods: Array<{
        name: string;
        price: number;
    }>;
    paymentMethods: Array<{
        name: string;
        handler: ConfigurableOperationInput;
    }>;
    collections: CollectionDefinition[];
    facets: FacetData[]
}

type FacetData = {
    name: string;
    isPrivate?: boolean;
    code: string;
    values: FacetValueData[];
}

type FacetValueData = {
    name: string;
    code: string;
}

