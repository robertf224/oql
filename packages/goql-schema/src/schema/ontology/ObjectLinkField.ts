import type { LinkTypeSideV2, ObjectSet, ObjectTypeV2, OntologyFullMetadata } from "@osdk/foundry.ontologies";
import { lambda, LoadedRecordStep, loadOne, objectFieldSpec, ObjectStep } from "grafast";
import { NamedGraphQLFieldConfig } from "../utils/NamedGraphQLFieldConfig.js";
import { ObjectSetType } from "./ObjectSetType.js";
import { GetTypeReference } from "../utils/TypeRegistry.js";
import { OntologyObjectType } from "./OntologyObjectType.js";
import { assertNever } from "@valinor-enterprises/assertions";
import { GraphQLFieldConfig } from "graphql";
import { TypedOntologyObject } from "../utils/TypedOntologyObject.js";
import { context } from "../context.js";
import { LoadedObjectStep } from "./ObjectListStep.js";
import { getObjectLoader } from "./getObjectLoader.js";

function create(
    path: string,
    getTypeReference: GetTypeReference,
    linkType: LinkTypeSideV2,
    sourceObjectType: ObjectTypeV2,
    ontology: OntologyFullMetadata
): NamedGraphQLFieldConfig {
    const fullPath = `${path}.${linkType.apiName}`;

    const targetObjectType = ontology.objectTypes[linkType.objectTypeApiName]!.objectType;

    let field: GraphQLFieldConfig<any, any, any>;
    if (linkType.cardinality === "ONE") {
        field = objectFieldSpec<LoadedRecordStep<TypedOntologyObject> | LoadedObjectStep>(
            {
                description: `Get the linked ${linkType.displayName}.`,
                // TODO: deprecation
                type: OntologyObjectType.getReferenceByName(getTypeReference, linkType.objectTypeApiName),
                plan: ($object) => {
                    const $foreignKey = $object.get(linkType.foreignKeyPropertyApiName!);
                    return loadOne($foreignKey, context(), getObjectLoader(targetObjectType));
                },
            },
            fullPath
        );
    } else if (linkType.cardinality === "MANY") {
        // We need the reverse link type to get the foreign key API name.
        const foreignKeyPropertyApiName = ontology.objectTypes[linkType.objectTypeApiName]!.linkTypes.find(
            (l) => l.linkTypeRid === linkType.linkTypeRid
        )!.foreignKeyPropertyApiName!;
        field = objectFieldSpec<LoadedRecordStep<TypedOntologyObject> | LoadedObjectStep>(
            {
                description: `Get the linked ${linkType.displayName}.`,
                // TODO: deprecation
                type: ObjectSetType.getReferenceByName(getTypeReference, linkType.objectTypeApiName),
                plan: ($object) => {
                    const $primaryKey = $object.get(sourceObjectType.primaryKey);
                    return lambda(
                        $primaryKey,
                        (primaryKey): ObjectSet => ({
                            type: "filter",
                            objectSet: {
                                type: "base",
                                objectType: linkType.objectTypeApiName,
                            },
                            where: {
                                type: "eq",
                                field: foreignKeyPropertyApiName,
                                value: primaryKey,
                            },
                        })
                    );
                },
            },
            fullPath
        );
    } else {
        assertNever(linkType.cardinality, "Unknown link cardinality.");
    }

    return [linkType.apiName, field];
}

export const ObjectLinkField = {
    create,
};
