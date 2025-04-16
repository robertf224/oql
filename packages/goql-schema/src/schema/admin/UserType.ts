import { User } from "@osdk/foundry.admin";
import { LoadedRecordStep, objectSpec, ObjectTypeFields } from "grafast";
import { GraphQLObjectType, GraphQLString } from "graphql";
import { GetTypeReference } from "../utils/TypeRegistry.js";
import { Schemas } from "../utils/Schemas.js";

function create(): GraphQLObjectType {
    return new GraphQLObjectType(
        objectSpec<LoadedRecordStep<User>, ObjectTypeFields<LoadedRecordStep<User>>>({
            name: "User",
            description: "A Foundry user or service account.",
            fields: {
                id: {
                    type: Schemas.required(GraphQLString),
                    description: "The unique identifier for the User.",
                },
                username: {
                    type: Schemas.required(GraphQLString),
                    description: "The unique username for the User.",
                },
                givenName: {
                    type: GraphQLString,
                    description: "The given name of the User.",
                },
                familyName: {
                    type: GraphQLString,
                    description: "The family name (last name) of the User.",
                },
                email: {
                    type: GraphQLString,
                    description:
                        "The email at which to contact a User. Multiple Users may have the same email address.",
                },
            },
        })
    );
}

function getReference(getTypeReference: GetTypeReference): GraphQLObjectType {
    return getTypeReference("User") as GraphQLObjectType;
}

export const UserType = {
    create,
    getReference,
};
