import { ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { objectFieldSpec } from "grafast";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { GetTypeReference } from "../TypeRegistry.js";
import { ObjectListTypes } from "./ObjectListTypes.js";
import { objectListConnection } from "./ObjectListStep.js";

function create(
    path: string,
    getTypeReference: GetTypeReference,
    objectType: ObjectTypeV2
): NamedGraphQLFieldConfig {
    const field = objectFieldSpec(
        {
            description: `A list of ${objectType.pluralDisplayName}.`,
            // TODO: args
            type: ObjectListTypes.getPageTypeReference(getTypeReference, objectType),
            plan: ($objectSet, $args) => objectListConnection(objectType, $objectSet),
        },
        `${path}.list`
    );

    return ["list", field];
}

export const ObjectListField = {
    create,
};
