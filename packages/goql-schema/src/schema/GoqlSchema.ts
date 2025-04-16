import { GraphQLObjectType } from "graphql";
import { GraphQLSchema } from "graphql";
import type { OntologyFullMetadata } from "@osdk/foundry.ontologies";
import { OntologyQueryFields } from "./ontology/OntologyQueryFields.js";
import { TypeRegistry } from "./utils/TypeRegistry.js";
import { OntologyObjectType } from "./ontology/OntologyObjectType.js";
import { ObjectSetType } from "./ontology/ObjectSetType.js";
import { ListTypes } from "./utils/ListTypes.js";
import { ObjectListTypes } from "./ontology/ObjectListTypes.js";
import { UserType } from "./admin/UserType.js";
import { UserQueryFields } from "./admin/UserQueryFields.js";
import { UserProperties } from "./utils/getUserProperties.js";

function create(ontology: OntologyFullMetadata, userProperties: UserProperties = {}): GraphQLSchema {
    const typeRegistry = new TypeRegistry();

    const ontologyTypes = Object.values(ontology.objectTypes)
        .flatMap((objectType) => [
            OntologyObjectType.create(typeRegistry, objectType, ontology, userProperties),
            ObjectSetType.create(typeRegistry, objectType),
            ObjectListTypes.createPageType(typeRegistry, objectType.objectType),
            ObjectListTypes.createEdgeType(typeRegistry, objectType.objectType),
            ObjectListTypes.createOrderByType(typeRegistry, objectType.objectType),
            ObjectListTypes.createPropertyNameType(objectType.objectType),
            ObjectListTypes.createFieldOrderingType(typeRegistry, objectType.objectType),
        ])
        .concat([ObjectListTypes.OrderingDirectionType]);

    const adminTypes = [UserType.create()];

    const types = [...ontologyTypes, ...adminTypes, ListTypes.PageInfoType];
    types.forEach(typeRegistry.register);

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: "Query",
            fields: typeRegistry.use((getTypeReference) =>
                Object.fromEntries([
                    ...OntologyQueryFields.create(getTypeReference, ontology),
                    ...UserQueryFields.create(getTypeReference),
                ])
            ),
        }),
        types,
    });
}

export const GoqlSchema = {
    create,
};
