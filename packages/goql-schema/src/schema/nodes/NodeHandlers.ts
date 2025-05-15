import { constant, list, loadOne } from "grafast";
import { NodeIdCodec, NodeIdHandler, LoadOneCallback, LoadedRecordStep, ListStep, Step } from "grafast";
import { Base64 } from "js-base64";
import { context, GoqlContext } from "../context.js";

const BASIC_CODEC: NodeIdCodec = {
    name: "basic-codec",
    encode: (id) => Base64.encode(JSON.stringify(id)),
    decode: (id) => JSON.parse(Base64.decode(id)) as [string, string],
};

function createBasicHandler(
    typeName: string,
    idFieldName: string,
    loader: LoadOneCallback<string, any, {}, GoqlContext>
): NodeIdHandler {
    return {
        typeName,
        codec: BASIC_CODEC,
        // Create a structured id from the object.
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

export const NodeHandlers = {
    createBasicHandler,
};
