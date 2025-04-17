import { node, Step, objectFieldSpec, NodeIdHandler } from "grafast";
import { GraphQLID } from "graphql";
import { NodeInterface } from "./NodeInterface.js";
import { NamedGraphQLFieldConfig } from "../utils/NamedGraphQLFieldConfig.js";
import { GetTypeReference } from "../utils/TypeRegistry.js";
import { Schemas } from "../utils/Schemas.js";

function create(getTypeReference: GetTypeReference, handlers: NodeIdHandler[]): NamedGraphQLFieldConfig {
    const handlersMap = Object.fromEntries(handlers.map((handler) => [handler.typeName, handler]));
    const field = objectFieldSpec(
        {
            description: "Get a record given its global id.",
            args: {
                [NodeInterface.FIELD_NAME]: {
                    description: "The global id of the record.",
                    type: Schemas.required(GraphQLID),
                },
            },
            type: NodeInterface.getReference(getTypeReference),
            plan: (_$parent, $args) => {
                const $id = $args.getRaw(NodeInterface.FIELD_NAME) as Step<string>;
                return node(handlersMap, $id);
            },
        },
        "Query.node"
    );
    return ["node", field];
}

export const NodeField = {
    create,
};
