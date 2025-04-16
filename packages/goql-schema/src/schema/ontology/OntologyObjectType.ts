import type {
    ObjectTypeApiName,
    ObjectTypeFullMetadata,
    ObjectTypeV2,
    OntologyFullMetadata,
} from "@osdk/foundry.ontologies";
import { GraphQLObjectType } from "graphql";
import { ObjectPropertyField } from "./ObjectPropertyField.js";
import { GetTypeReference, TypeRegistry } from "../utils/TypeRegistry.js";
import { Result } from "@bobbyfidz/result";
import { ObjectLinkField } from "./ObjectLinkField.js";
import { UserProperties } from "../utils/getUserProperties.js";
import { ObjectUserLinkField } from "./ObjectUserLinkField.js";

function create(
    typeRegistry: TypeRegistry,
    objectType: ObjectTypeFullMetadata,
    ontology: OntologyFullMetadata,
    userProperties: UserProperties
): GraphQLObjectType {
    const typeName = getName(objectType.objectType);
    return new GraphQLObjectType({
        name: typeName,
        description: objectType.objectType.description,
        fields: typeRegistry.use((getTypeReference) => {
            const propertyFields = Object.entries(objectType.objectType.properties)
                .map((property) => ObjectPropertyField.create(typeName, property))
                // TODO: handle errors
                .filter(Result.isOk)
                .map(Result.unwrap);
            const linkFields = objectType.linkTypes.map((linkType) =>
                ObjectLinkField.create(typeName, getTypeReference, linkType, objectType.objectType, ontology)
            );
            const userLinkFields = Object.entries(objectType.objectType.properties)
                .filter(([_, property]) => userProperties[property.rid])
                .map((property) => ObjectUserLinkField.create(typeName, getTypeReference, property));
            return Object.fromEntries([...propertyFields, ...linkFields, ...userLinkFields]);
        }),
    });
}

function getName(objectType: ObjectTypeV2): string {
    return objectType.apiName;
}

function getReference(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): GraphQLObjectType {
    return getTypeReference(getName(objectType)) as GraphQLObjectType;
}

function getReferenceByName(
    getTypeReference: GetTypeReference,
    apiName: ObjectTypeApiName
): GraphQLObjectType {
    return getTypeReference(apiName) as GraphQLObjectType;
}

export const OntologyObjectType = {
    create,
    getReference,
    getReferenceByName,
};
