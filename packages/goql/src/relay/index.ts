import { Client } from "@osdk/client";
import { Network } from "relay-runtime";

export function createNetwork(client: Client): ReturnType<typeof Network.create> {
    return Network.create(async (request, variables) => {
        // eslint-disable-next-line
        const response = await (client({ type: "query", apiName: "graphql" }) as any).executeFunction({
            query: request.text,
            operationName: request.name ?? "",
            variables: JSON.stringify(variables),
            token: await client.__osdkClientContext.tokenProvider(),
        });
        // eslint-disable-next-line
        return JSON.parse(response);
    });
}

export { missingFieldHandlers } from "../relay-shared/index.js";
