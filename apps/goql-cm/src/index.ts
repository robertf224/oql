import { execute } from "grafast";
import { parse, validate } from "graphql";
import { ExecutableGoqlSchema } from "@bobbyfidz/goql-schema";
import { ComputeModule } from "@palantir/compute-module";
import { Type } from "@sinclair/typebox";
import { useValidationCache } from "@envelop/validation-cache";
import { envelop, useSchema, useEngine } from "@envelop/core";
import { useParserCache } from "@envelop/parser-cache";
import { createClient } from "@osdk/client";
import { getFoundryClient } from "./getFoundryClient.js";

export const computeModule = new ComputeModule({
    definitions: {
        graphql: {
            input: Type.Object({
                query: Type.String(),
                operationName: Type.Optional(Type.String()),
                variables: Type.Any(),
                // TODO: find a better way to get user auth token into here.
                token: Type.String(),
            }),
            output: Type.String(),
        },
    },
});

const { schema, context } = await ExecutableGoqlSchema.create(getFoundryClient(), (token) =>
    createClient(process.env.FOUNDRY_URL!, process.env.FOUNDRY_ONTOLOGY_RID!, () => Promise.resolve(token))
);

const getEnveloped = envelop({
    plugins: [
        useEngine({ parse, validate, execute }),
        useSchema(schema),
        useParserCache(),
        useValidationCache(),
    ],
});

computeModule.register("graphql", async ({ query, operationName, variables, token }) => {
    const { parse, validate, execute, schema } = getEnveloped();

    const document = parse(query);
    const validationErrors = validate(schema, document);

    if (validationErrors.length > 0) {
        return JSON.stringify({ errors: validationErrors });
    }

    const contextValue = await context(token);

    const result = await execute({
        document,
        schema,
        operationName,
        variableValues: variables,
        contextValue,
    });

    return JSON.stringify(result);
});

computeModule.on("responsive", () => {
    console.log("Started...");
});
