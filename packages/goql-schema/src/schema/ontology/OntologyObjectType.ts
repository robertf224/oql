import type {
    ObjectTypeApiName,
    ObjectTypeFullMetadata,
    ObjectTypeV2,
    OntologyFullMetadata,
} from "@osdk/foundry.ontologies";
import { objectSpec } from "grafast";
import { GraphQLObjectType } from "graphql";
import { ObjectPropertyField } from "./ObjectPropertyField.js";
import { GetTypeReference, TypeRegistry } from "../TypeRegistry.js";
import { Result } from "@bobbyfidz/result";
import { ObjectLinkField } from "./ObjectLinkField.js";

function create(
    typeRegistry: TypeRegistry,
    objectType: ObjectTypeFullMetadata,
    ontology: OntologyFullMetadata
): GraphQLObjectType {
    const typeName = getName(objectType.objectType);
    return new GraphQLObjectType(
        objectSpec({
            name: typeName,
            description: objectType.objectType.description,
            fields: typeRegistry.use((getTypeReference) => {
                const propertyFields = Object.entries(objectType.objectType.properties)
                    .map((property) => ObjectPropertyField.create(typeName, property))
                    // TODO: handle errors
                    .filter(Result.isOk)
                    .map(Result.unwrap);
                const linkFields = objectType.linkTypes.map((linkType) =>
                    ObjectLinkField.create(
                        typeName,
                        getTypeReference,
                        linkType,
                        objectType.objectType,
                        ontology
                    )
                );
                return Object.fromEntries([...propertyFields, ...linkFields]);
            }),
        })
    );
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
