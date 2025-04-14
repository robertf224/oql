import { OntologyObjectsV2, ObjectTypeV2, PropertyApiName } from "@osdk/foundry.ontologies";
import { LoadedRecordStep, loadOne, objectFieldSpec, Step, loadOneCallback } from "grafast";
import { camelCase } from "change-case";
import { GetTypeReference } from "../TypeRegistry.js";
import { ObjectArgumentType } from "./ObjectArgumentType.js";
import { OqlGraphQLContext, context } from "../context.js";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { TypedOntologyObject } from "../TypedOntologyObject.js";
import { OntologyObjectType } from "./OntologyObjectType.js";

type PrimaryKeyValue = string | number | boolean;

function create(getTypeReference: GetTypeReference, objectType: ObjectTypeV2): NamedGraphQLFieldConfig {
    // TODO: lift this further up
    const loadObjects = loadOneCallback<PrimaryKeyValue, TypedOntologyObject, {}, OqlGraphQLContext>(
        async (ids, { attributes, unary: context }) => {
            // TODO: handle page sizes
            const objects = await OntologyObjectsV2.search(
                context.client,
                context.ontologyRid,
                objectType.apiName,
                {
                    where: {
                        type: "in",
                        field: objectType.primaryKey,
                        value: ids as PrimaryKeyValue[],
                    },
                    pageSize: ids.length,
                    select: attributes as PropertyApiName[],
                }
            );
            // TODO: make sure we properly join up objects in the correct order
            return objects.data.map((object) => ({
                ...object,
                $objectType: objectType,
            }));
        }
    );

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
                return loadOne($args.getRaw(objectType.primaryKey), context(), loadObjects);
            },
        },
        `Query.${fieldName}`
    );

    return [fieldName, field];
}

export const ObjectQueryField = {
    create,
};
