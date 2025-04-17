import type { Client } from "@osdk/client";
import { OntologyIdentifier } from "@osdk/foundry.ontologies";
import { context as baseContext } from "grafast";

export interface GoqlContext {
    client: Client;
    ontologyRid: OntologyIdentifier;
    userId: string;
}

// Export a typed context step rather than polluting the global namespace as suggested by https://grafast.org/grafast/step-library/standard-steps/context/#typescript
export const context = baseContext<GoqlContext>;
