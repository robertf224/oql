import type { PropertyApiName, PropertyV2 } from "@osdk/foundry.ontologies";
import { LoadedRecordStep, loadOne, objectFieldSpec } from "grafast";
import { NamedGraphQLFieldConfig } from "../utils/NamedGraphQLFieldConfig.js";
import { GetTypeReference } from "../utils/TypeRegistry.js";
import { GraphQLObjectType } from "graphql";
import { TypedOntologyObject } from "../utils/TypedOntologyObject.js";
import { context } from "../context.js";
import { LoadedObjectStep } from "./ObjectListStep.js";
import { UserLoader } from "../admin/UserLoader.js";

function create(
    path: string,
    getTypeReference: GetTypeReference,
    [propertyApiName, property]: [PropertyApiName, PropertyV2]
): NamedGraphQLFieldConfig {
    const fieldName = `${propertyApiName}User`;
    const field = objectFieldSpec<LoadedRecordStep<TypedOntologyObject> | LoadedObjectStep>(
        {
            description: property.description,
            type: getTypeReference("User") as GraphQLObjectType,
            plan: ($object) => {
                const $propertyValue = $object.get(propertyApiName);
                return loadOne($propertyValue, context(), UserLoader);
            },
        },
        `${path}.${fieldName}`
    );
    return [fieldName, field];
}

export const ObjectUserLinkField = {
    create,
};
