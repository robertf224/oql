import { ExecutableGoqlSchema } from "@bobbyfidz/goql-schema";
import { createClient } from "@osdk/client";
import { ComputeModule } from "@palantir/compute-module";
import { Type } from "@sinclair/typebox";
import { getFoundryClient } from "./getFoundryClient.js";

export const computeModule = new ComputeModule({
    definitions: {
        graphql: {
            input: Type.Object({
                query: Type.String(),
                operationName: Type.Optional(Type.String()),
                variables: Type.String(),
                // TODO: find a better way to get user auth token into here.
                token: Type.String(),
            }),
            output: Type.String(),
        },
    },
});

const executableGoqlSchema = await ExecutableGoqlSchema.create(getFoundryClient(), (token) =>
    createClient(process.env.FOUNDRY_URL!, process.env.FOUNDRY_ONTOLOGY_RID!, () => Promise.resolve(token))
);

const executor = ExecutableGoqlSchema.createExecutor(executableGoqlSchema);

computeModule.register("graphql", async ({ query, operationName, variables, token }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await executor({ query, operationName, variables: JSON.parse(variables), token });
    return JSON.stringify(result);
});

computeModule.on("responsive", () => {
    console.log("Started...");
});
