import type { LinkTypeSideV2 } from "@osdk/foundry.ontologies";
import { objectFieldSpec, ObjectStep } from "grafast";
import { NamedGraphQLFieldConfig } from "../NamedGraphQLFieldConfig.js";
import { ObjectSetType } from "./ObjectSetType.js";
import { GetTypeReference } from "../TypeRegistry.js";
import { OntologyObjectType } from "./OntologyObjectType.js";
import { Kind, parse } from "graphql";

const doc = parse(`
    type Query {
        hello: String
    }
`);

function create(
    path: string,
    getTypeReference: GetTypeReference,
    linkType: LinkTypeSideV2
): NamedGraphQLFieldConfig {
    const field = objectFieldSpec<ObjectStep>(
        {
            description: `Get the linked ${linkType.displayName}.`,
            // TODO: deprecation
            type:
                linkType.cardinality === "MANY"
                    ? ObjectSetType.getReferenceByName(getTypeReference, linkType.objectTypeApiName)
                    : OntologyObjectType.getReferenceByName(getTypeReference, linkType.objectTypeApiName),
            plan: ($object) => {
                return $object.get(linkType.apiName);
            },
        },
        `${path}.${linkType.apiName}`
    );
    return [linkType.apiName, field];
}

export const ObjectLinkField = {
    create,
};
