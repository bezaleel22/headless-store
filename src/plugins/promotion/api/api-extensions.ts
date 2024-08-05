import gql from 'graphql-tag';

export const shopApiExtensions = gql`
    extend type Query {
        promotions: PromotionList!
    }
`;