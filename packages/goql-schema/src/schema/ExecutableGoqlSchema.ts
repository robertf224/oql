import { envelop, useSchema, useEngine } from "@envelop/core";
import { useParserCache } from "@envelop/parser-cache";
import { useValidationCache } from "@envelop/validation-cache";
import { Client } from "@osdk/client";
import { bulkLoadOntologyEntities, loadAllOntologies } from "@osdk/client.unstable";
import { OntologiesV2 } from "@osdk/foundry.ontologies";
import { execute } from "grafast";
import { parse, validate } from "graphql";
import { GraphQLSchema } from "graphql";
import { GoqlContext } from "./context.js";
import { GoqlSchema } from "./GoqlSchema.js";
import { getConjureContext } from "./utils/getConjureContext.js";
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
    const ontologyInformation = await loadAllOntologies(
        getConjureContext(client, "ontology-metadata/api"),
        {}
    );
    const ontologyVersion = ontologyInformation.ontologies[ontologyRid]!.currentOntologyVersion;
    const { objectTypes } = await bulkLoadOntologyEntities(
        getConjureContext(client, "ontology-metadata/api"),
        undefined,
        {
            objectTypes: Object.values(ontology.objectTypes).map((o) => ({
                identifier: { type: "objectTypeRid", objectTypeRid: o.objectType.rid },
                versionReference: {
                    type: "ontologyVersion",
                    ontologyVersion,
                },
            })),
            linkTypes: [],
            sharedPropertyTypes: [],
            interfaceTypes: [],
            typeGroups: [],
            loadRedacted: false,
            includeObjectTypeCount: undefined,
            includeObjectTypesWithoutSearchableDatasources: true,
            includeEntityMetadata: undefined,
            actionTypes: [],
            includeTypeGroupEntitiesCount: undefined,
            entityMetadata: undefined,
            datasourceTypes: [],
        }
    );
    const userProperties = getUserProperties(
        objectTypes.map((o) => o?.objectType).filter((o) => o !== undefined)
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
