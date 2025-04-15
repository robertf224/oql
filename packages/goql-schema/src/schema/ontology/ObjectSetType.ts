import type { ObjectTypeApiName, ObjectTypeFullMetadata, ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { objectSpec } from "grafast";
import { GraphQLObjectType } from "graphql";
import { GetTypeReference, TypeRegistry } from "../TypeRegistry.js";
import { ObjectListField } from "./ObjectListField.js";

function create(typeRegistry: TypeRegistry, objectType: ObjectTypeFullMetadata): GraphQLObjectType {
    const typeName = getName(objectType.objectType);
    return new GraphQLObjectType(
        objectSpec({
            name: typeName,
            description: `A set of ${objectType.objectType.pluralDisplayName}.`,
            // TODO: deprecation
            fields: typeRegistry.use((getTypeReference) => {
                const listField = ObjectListField.create(typeName, getTypeReference, objectType.objectType);
                return Object.fromEntries([listField]);
            }),
        })
    );
}

function getName(objectType: ObjectTypeV2): string {
    return `${objectType.apiName}Set`;
}

function getReference(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): GraphQLObjectType {
    return getTypeReference(getName(objectType)) as GraphQLObjectType;
}

function getReferenceByName(
    getTypeReference: GetTypeReference,
    apiName: ObjectTypeApiName
): GraphQLObjectType {
    return getTypeReference(`${apiName}Set`) as GraphQLObjectType;
}
export const ObjectSetType = {
    create,
    getReference,
    getReferenceByName,
};
