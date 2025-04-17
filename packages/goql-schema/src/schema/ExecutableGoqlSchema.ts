import { Client } from "@osdk/client";
import { OntologiesV2 } from "@osdk/foundry.ontologies";
import oms from "@bobbyfidz/private-oms-api";
import { GraphQLSchema } from "graphql";
import { GoqlContext } from "./context.js";
import { getUserProperties } from "./utils/getUserProperties.js";
import { GoqlSchema } from "./GoqlSchema.js";
import { getConjureClient } from "./utils/getConjureClient.js";
import { getUserIdFromToken } from "./utils/getUserIdFromToken.js";

async function create(
    client: Client,
    createRequestClient: (token: string) => Client
): Promise<{ schema: GraphQLSchema; context: (token: string) => Promise<GoqlContext> }> {
    const ontologyRid = (client.__osdkClientContext as unknown as { ontologyRid: string }).ontologyRid;
    const ontology = await OntologiesV2.getFullMetadata(client, ontologyRid);
    const ontologyMetadataService = getConjureClient(
        client,
        oms.ontologyMetadataApi.OntologyMetadataService,
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
        const requestClient = createRequestClient(token);
        const userId = getUserIdFromToken(await requestClient.__osdkClientContext.tokenProvider());
        return {
            client: requestClient,
            ontologyRid,
            userId,
        };
    };
    return { schema, context };
}

export const ExecutableGoqlSchema = {
    create,
};
