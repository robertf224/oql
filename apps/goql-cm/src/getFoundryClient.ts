import { Client, createClient } from "@osdk/client";
import { createConfidentialOauthClient } from "@osdk/oauth";
import { assert } from "@valinor-enterprises/assertions";

export function createFoundryClient(): Client {
    // These are reserved Compute Module variables (https://www.palantir.com/docs/foundry/compute-modules/containers#environment-variables).
    assert(process.env.CLIENT_ID, "CLIENT_ID");
    assert(process.env.CLIENT_SECRET, "CLIENT_SECRET");

    // These should be set as a environment variables on the Compute Module.
    assert(process.env.FOUNDRY_ONTOLOGY_RID, "FOUNDRY_ONTOLOGY_RID");
    assert(process.env.FOUNDRY_URL, "FOUNDRY_URL");

    const auth = createConfidentialOauthClient(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.FOUNDRY_URL
    );
    return createClient(process.env.FOUNDRY_URL, process.env.FOUNDRY_ONTOLOGY_RID, auth);
}

let client: Client | undefined;
export function getFoundryClient() {
    if (!client) {
        client = createFoundryClient();
    }
    return client;
}
