import { assert } from "@valinor-enterprises/assertions";
import type { GraphQLFieldConfig, GraphQLNamedType } from "graphql";

export type GetTypeReference = (name: string) => GraphQLNamedType;

export class TypeRegistry {
    #types: Map<string, GraphQLNamedType> = new Map();

    register = (type: GraphQLNamedType) => {
        this.#types.set(type.name, type);
    };

    use = (
        fields: (getTypeReference: GetTypeReference) => Record<string, GraphQLFieldConfig<any, any>>
    ): (() => Record<string, GraphQLFieldConfig<any, any>>) => {
        return () => fields(this.#get);
    };

    #get: GetTypeReference = (name) => {
        const type = this.#types.get(name);
        assert(type, `Type ${name} not found.`);
        return type;
    };
}
