import { ObjectSet, ObjectTypeV2, OntologyObjectSets } from "@osdk/foundry.ontologies";
import { objectFieldSpec } from "grafast";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { GetTypeReference } from "../TypeRegistry.js";
import { CobaltGraphQLContext } from "../context.js";
import { TypedOntologyObject } from "../TypedOntologyObject.js";
import { ObjectListTypes } from "./ObjectListTypes.js";

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
            resolve: async (objectSet: ObjectSet, args: {}, context: CobaltGraphQLContext) => {
                const data = await OntologyObjectSets.load(context.client, context.ontologyRid, {
                    objectSet,
                    select: Object.keys(objectType.properties),
                    pageSize: 10,
                });
                return {
                    hasMore: data.nextPageToken !== undefined,
                    endCursor: data.nextPageToken,
                    edges: data.data.map((object) => ({
                        node: { $objectType: objectType, ...object } satisfies TypedOntologyObject,
                    })),
                };
            },
        },
        `${path}.list`
    );

    return ["list", field];
}

export const ObjectListField = {
    create,
};
