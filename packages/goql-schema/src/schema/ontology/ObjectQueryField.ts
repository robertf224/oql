import { ObjectTypeV2 } from "@osdk/foundry.ontologies";
import { LoadedRecordStep, loadOne, objectFieldSpec, Step } from "grafast";
import { camelCase } from "change-case";
import { GetTypeReference } from "../TypeRegistry.js";
import { ObjectArgumentType } from "./ObjectArgumentType.js";
import { context } from "../context.js";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { TypedOntologyObject } from "../TypedOntologyObject.js";
import { OntologyObjectType } from "./OntologyObjectType.js";
import { getObjectLoader } from "./getObjectLoader.js";

function create(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): NamedGraphQLFieldConfig {
    const fieldName = camelCase(objectType.apiName);

    const field = objectFieldSpec<Step, LoadedRecordStep<TypedOntologyObject>>(
        {
            description: `Get a single ${objectType.displayName}.`,
            // TODO: deprecation
            args: {
                [objectType.primaryKey]: {
                    type: ObjectArgumentType.get(objectType),
                },
            },
            type: OntologyObjectType.getReference(getTypeReference, objectType),
            plan: (_$query, $args) => {
                return loadOne($args.getRaw(objectType.primaryKey), context(), getObjectLoader(objectType));
            },
        },
        `Query.${fieldName}`
    );

    return [fieldName, field];
}

export const ObjectQueryField = {
    create,
};
