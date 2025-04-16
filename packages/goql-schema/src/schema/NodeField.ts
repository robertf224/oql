import {
    node,
    Step,
    objectFieldSpec,
    NodeIdHandler,
    NodeIdCodec,
    LoadedRecordStep,
    constant,
    list,
    ListStep,
    loadOne,
    LoadOneCallback,
} from "grafast";
import { GraphQLID } from "graphql";
import { Result } from "@bobbyfidz/result";
import { Base64 } from "@bobbyfidz/base64";
import { NodeInterface } from "./NodeInterface.js";
import { NamedGraphQLFieldConfig } from "./utils/NamedGraphQLFieldConfig.js";
import { GetTypeReference } from "./utils/TypeRegistry.js";
import { Schemas } from "./utils/Schemas.js";
import { context, GoqlContext } from "./context.js";

const BASIC_CODEC: NodeIdCodec = {
    name: "basic-codec",
    encode: (id) => Base64.encode(JSON.stringify(id)),
    decode: (id) => JSON.parse(Result.unwrap(Base64.decode(id))),
};

function createBasicHandler(
    typeName: string,
    idFieldName: string,
    loader: LoadOneCallback<string, any, {}, GoqlContext>
): NodeIdHandler {
    return {
        typeName,
        codec: BASIC_CODEC,
        plan: ($object: LoadedRecordStep<any>) => {
            return list([constant(typeName), $object.get(idFieldName)]);
        },
        // Check if structured id is for our type.
        match(list: [string, string]) {
            return list[0] === typeName;
        },
        // Get the narrowed id from the structured id.
        getSpec($list: ListStep<[Step<string>, Step<string>]>): Step<string> {
            return $list.at(1);
        },
        // Fetch the object by id.
        get($id: Step<string>) {
            return loadOne($id, context(), loader);
        },
        // TODO: figure out what this is.
        getIdentifiers: () => [],
    };
}

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
    createBasicHandler,
};
