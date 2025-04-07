import { constant, Step } from "grafast";
import { camelCase } from "change-case";
import { GetTypeReference } from "../TypeRegistry.js";
import { ObjectSet, ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { objectFieldSpec } from "grafast";
import { ObjectSetType } from "./ObjectSetType.js";

function create(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): NamedGraphQLFieldConfig {
    const fieldName = `${camelCase(objectType.apiName)}Search`;

    const field = objectFieldSpec<Step, Step<ObjectSet>>(
        {
            description: `Search or list ${objectType.pluralDisplayName}.`,
            // TODO: deprecation
            // TODO: args
            type: ObjectSetType.getReference(getTypeReference, objectType),
            plan: () => {
                return constant<ObjectSet>({
                    type: "base",
                    objectType: objectType.apiName,
                });
            },
        },
        `Query.${fieldName}`
    );

    return [fieldName, field];
}

export const ObjectSearchQueryField = {
    create,
};
