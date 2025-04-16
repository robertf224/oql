import { PropertyApiName, SearchJsonQueryV2 } from "@osdk/foundry.ontologies";
import { GetTypeReference } from "../utils/TypeRegistry.js";
import { GraphQLInputObjectType, GraphQLString } from "graphql";
import { assertNever } from "@valinor-enterprises/assertions";

const TYPE_NAME = "StringFilter";

export interface StringFilter {
    eq?: string;
    contains?: string;
}
function toObjectSetFilter(field: PropertyApiName, filter: StringFilter): SearchJsonQueryV2 {
    if (filter.eq) {
        return {
            type: "eq",
            field,
            value: filter.eq,
        };
    } else if (filter.contains) {
        return {
            type: "containsAllTermsInOrderPrefixLastTerm",
            field,
            value: filter.contains,
        };
    } else {
        assertNever(filter as never);
    }
}

function create(): GraphQLInputObjectType {
    return new GraphQLInputObjectType({
        name: TYPE_NAME,
        description: "A filter for a String field.",
        isOneOf: true,
        fields: {
            eq: {
                description: "The field must be equal to the provided value.",
                type: GraphQLString,
            },
            contains: {
                description: "The field must contain the provided substring.",
                type: GraphQLString,
            },
        },
    });
}

function getReference(getTypeReference: GetTypeReference): GraphQLInputObjectType {
    return getTypeReference(TYPE_NAME) as GraphQLInputObjectType;
}

export const StringFilterType = {
    create,
    getReference,
    toObjectSetFilter,
};
