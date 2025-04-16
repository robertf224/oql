import { assert } from "@valinor-enterprises/assertions";
import type {
    GraphQLFieldConfig,
    GraphQLInputFieldConfig,
    GraphQLInterfaceType,
    GraphQLNamedType,
} from "graphql";

export type GetTypeReference = (name: string) => GraphQLNamedType;

export class TypeRegistry {
    #types: Map<string, GraphQLNamedType> = new Map();

    register = (type: GraphQLNamedType) => {
        this.#types.set(type.name, type);
    };

    use = <T extends GraphQLFieldConfig<any, any> | GraphQLInputFieldConfig | GraphQLInterfaceType>(
        fields: (
            getTypeReference: GetTypeReference
        ) => T extends GraphQLInterfaceType ? T[] : Record<string, T>
    ): (() => T extends GraphQLInterfaceType ? T[] : Record<string, T>) => {
        return () => fields(this.#get);
    };

    #get: GetTypeReference = (name) => {
        const type = this.#types.get(name);
        assert(type, `Type ${name} not found.`);
        return type;
    };
}
