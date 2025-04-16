import { createServer } from "node:http";
import { grafserv } from "grafserv/node";
import { ExecutableGoqlSchema } from "@bobbyfidz/goql-schema";
import { getFoundryClient } from "./getFoundryClient.js";

// TODO: switch to Hono when integration is available

export async function start() {
    const client = getFoundryClient();
    const { schema, context } = await ExecutableGoqlSchema.create(client, () => client);

    const serv = grafserv({
        schema,
        preset: {
            grafast: {
                context,
                explain: true,
            },
            grafserv: {
                graphiql: true,
            },
        },
    });

    const server = createServer();
    server.on("error", (e) => {
        console.error(e);
    });
    serv.addTo(server).catch((e) => {
        console.error(e);
        process.exit(1);
    });
    server.listen(8080);
}

start();
