import { ontologyMetadataApi } from "@bobbyfidz/oms";
import { envelop, useSchema, useEngine } from "@envelop/core";
import { useParserCache } from "@envelop/parser-cache";
import { useValidationCache } from "@envelop/validation-cache";
import { Client } from "@osdk/client";
import { OntologiesV2 } from "@osdk/foundry.ontologies";
import { execute } from "grafast";
import { parse, validate } from "graphql";
import { GraphQLSchema } from "graphql";
import { GoqlContext } from "./context.js";
import { GoqlSchema } from "./GoqlSchema.js";
import { getConjureClient } from "./utils/getConjureClient.js";
import { getUserIdFromToken } from "./utils/getUserIdFromToken.js";
import { getUserProperties } from "./utils/getUserProperties.js";

export interface ExecutableGoqlSchema {
    schema: GraphQLSchema;
    context: (token: string) => Promise<GoqlContext>;
}

async function create(
    client: Client,
    createRequestClient?: (token: string) => Client
): Promise<ExecutableGoqlSchema> {
    const ontologyRid = (client.__osdkClientContext as unknown as { ontologyRid: string }).ontologyRid;
    const ontology = await OntologiesV2.getFullMetadata(client, ontologyRid);
    const ontologyMetadataService = getConjureClient(
        client,
        ontologyMetadataApi.OntologyMetadataService,
        "/ontology-metadata/api"
    );
    const { objectTypes: privateApiObjectTypes } = await ontologyMetadataService.bulkLoadOntologyEntities({
        objectTypes: Object.values(ontology.objectTypes).map((o) => ({
            identifier: { type: "objectTypeRid", objectTypeRid: o.objectType.rid },
        })),
        linkTypes: [],
        sharedPropertyTypes: [],
        interfaceTypes: [],
        datasourceTypes: [],
        actionTypes: [],
        typeGroups: [],
    });
    const userProperties = getUserProperties(
        privateApiObjectTypes.map((o) => o?.objectType).filter((o) => o !== undefined)
    );
    const schema = GoqlSchema.create(ontology, userProperties);
    const context = async (token: string): Promise<GoqlContext> => {
        const requestClient = createRequestClient?.(token) ?? client;
        const userId = getUserIdFromToken(await requestClient.__osdkClientContext.tokenProvider());
        return {
            client: requestClient,
            ontologyRid,
            userId,
        };
    };
    return { schema, context };
}

export type GoqlExecutor = (opts: {
    query: string;
    operationName?: string;
    variables: Record<string, unknown>;
    token: string;
}) => Promise<any>;

function createExecutor(executableGoqlSchema: ExecutableGoqlSchema): GoqlExecutor {
    const { schema, context } = executableGoqlSchema;

    const getEnveloped = envelop({
        plugins: [
            useEngine({ parse, validate, execute }),
            useSchema(schema),
            useParserCache(),
            useValidationCache(),
        ],
    });

    return async ({ query, operationName, variables, token }) => {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
    };
}

export const ExecutableGoqlSchema = {
    create,
    createExecutor,
};
