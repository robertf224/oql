import type { ObjectTypeFullMetadata, ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { objectSpec } from "grafast";
import { GraphQLObjectType } from "graphql";
import { ObjectPropertyField } from "./ObjectPropertyField.js";
import { GetTypeReference, TypeRegistry } from "../TypeRegistry.js";
import { Result } from "../../utils/Result.js";

function create(_typeRegistry: TypeRegistry, objectType: ObjectTypeFullMetadata): GraphQLObjectType {
    const typeName = getName(objectType.objectType);
    return new GraphQLObjectType(
        objectSpec({
            name: typeName,
            description: objectType.objectType.description,
            fields: () => {
                const propertyFields = Object.entries(objectType.objectType.properties)
                    .map((property) => ObjectPropertyField.create(typeName, property))
                    // TODO: handle errors
                    .filter(Result.isOk)
                    .map(Result.unwrap);
                return Object.fromEntries([...propertyFields]);
            },
        })
    );
}

function getName(objectType: ObjectTypeV2): string {
    return objectType.apiName;
}

function getReference(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): GraphQLObjectType {
    return getTypeReference(getName(objectType)) as GraphQLObjectType;
}

export const OntologyObjectType = {
    create,
    getReference,
};
