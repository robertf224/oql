import { createServer } from "node:http";
import { grafserv } from "grafserv/node";
import { OntologiesV2 } from "@osdk/foundry.ontologies";
import { OqlGraphQLSchema } from "@bobbyfidz/oql-graphql-schema";
import { getFoundryClient } from "./getFoundryClient.js";

// TODO: switch to Hono when integration is available

export async function start() {
    const client = getFoundryClient();
    const ontology = await OntologiesV2.getFullMetadata(client, process.env.FOUNDRY_ONTOLOGY_RID!);

    const serv = grafserv({
        schema: OqlGraphQLSchema.create(ontology),
        preset: {
            grafast: {
                context: {
                    client,
                    ontologyRid: process.env.FOUNDRY_ONTOLOGY_RID!,
                },
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
