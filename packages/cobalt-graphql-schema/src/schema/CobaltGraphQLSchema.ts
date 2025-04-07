import { GraphQLObjectType } from "graphql";
import { GraphQLSchema } from "graphql";
import type { OntologyFullMetadata } from "@osdk/foundry.ontologies";
import { OntologyQueryFields } from "./ontology/OntologyQueryFields.js";
import { TypeRegistry } from "./TypeRegistry.js";
import { OntologyObjectType } from "./ontology/OntologyObjectType.js";
import { ObjectSetType } from "./ontology/ObjectSetType.js";
import { ListTypes } from "./ListTypes.js";
import { ObjectListTypes } from "./ontology/ObjectListTypes.js";

function create(ontology: OntologyFullMetadata): GraphQLSchema {
    const typeRegistry = new TypeRegistry();

    const ontologyTypes = Object.values(ontology.objectTypes).flatMap((objectType) => [
        OntologyObjectType.create(typeRegistry, objectType),
        ObjectSetType.create(typeRegistry, objectType),
        ObjectListTypes.createPageType(typeRegistry, objectType.objectType),
        ObjectListTypes.createEdgeType(typeRegistry, objectType.objectType),
    ]);

    const types = [...ontologyTypes, ListTypes.PageInfoType];
    types.forEach(typeRegistry.register);

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: "Query",
            fields: typeRegistry.use((getTypeReference) =>
                Object.fromEntries([...OntologyQueryFields.create(getTypeReference, ontology)])
            ),
        }),
        types,
    });
}

export const CobaltGraphQLSchema = {
    create,
};
