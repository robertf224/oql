import { User } from "@osdk/foundry.admin";
import { LoadedRecordStep, nodeIdFromNode, NodeIdHandler, objectSpec, ObjectTypeFields } from "grafast";
import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { GetTypeReference, TypeRegistry } from "../utils/TypeRegistry.js";
import { Schemas } from "../utils/Schemas.js";
import { NodeInterface } from "../NodeInterface.js";
import { NodeField } from "../NodeField.js";
import { UserLoader } from "./UserLoader.js";

const TYPE_NAME = "User";

const NODE_ID_HANDLER: NodeIdHandler = NodeField.createBasicHandler(TYPE_NAME, "id", UserLoader);

function create(typeRegistry: TypeRegistry): GraphQLObjectType {
    return new GraphQLObjectType(
        objectSpec<LoadedRecordStep<User>, ObjectTypeFields<LoadedRecordStep<User>>>({
            name: TYPE_NAME,
            description: "A Foundry user or service account.",
            fields: {
                _id: {
                    type: Schemas.required(GraphQLID),
                    plan: ($object) => {
                        return nodeIdFromNode(NODE_ID_HANDLER, $object);
                    },
                },
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
            interfaces: typeRegistry.use((getTypeReference) => [
                NodeInterface.getReference(getTypeReference),
            ]),
        })
    );
}

function getReference(getTypeReference: GetTypeReference): GraphQLObjectType {
    return getTypeReference(TYPE_NAME) as GraphQLObjectType;
}

export const UserType = {
    create,
    getReference,
    NODE_ID_HANDLER,
};
