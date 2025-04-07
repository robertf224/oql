import { ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { GetTypeReference, TypeRegistry } from "../TypeRegistry.js";
import { GraphQLObjectType } from "graphql";
import { ListTypes } from "../ListTypes.js";

function createPageType(typeRegistry: TypeRegistry, objectType: ObjectTypeV2): GraphQLObjectType {
    return ListTypes.createPageType(typeRegistry, objectType.apiName, objectType.pluralDisplayName);
}

function createEdgeType(typeRegistry: TypeRegistry, objectType: ObjectTypeV2): GraphQLObjectType {
    return ListTypes.createEdgeType(
        typeRegistry,
        objectType.apiName,
        objectType.displayName,
        objectType.apiName,
        objectType.displayName
    );
}

function getPageTypeReference(
    getTypeReference: GetTypeReference,
    objectType: ObjectTypeV2
): GraphQLObjectType {
    return ListTypes.getPageTypeReference(getTypeReference, objectType.apiName);
}

export const ObjectListTypes = {
    createPageType,
    getPageTypeReference,
    createEdgeType,
};
