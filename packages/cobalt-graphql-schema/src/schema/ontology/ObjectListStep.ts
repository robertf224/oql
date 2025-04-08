import { access, each, ExecutionDetails, ExecutionResults, lambda, object, Step, __ItemStep } from "grafast";
import {
    ObjectSet,
    ObjectTypeV2,
    OntologyObjectSets,
    PropertyApiName,
    SelectedPropertyApiName,
} from "@osdk/foundry.ontologies";
import { assert } from "@valinor-enterprises/assertions";
import { TypedOntologyObject } from "../TypedOntologyObject.js";
import { CobaltGraphQLContext, context } from "../context.js";

export interface ObjectListStepData {
    data: TypedOntologyObject[];
    nextPageToken?: string;
}

class LoadedObjectStep extends Step<TypedOntologyObject> {
    static $$export = {
        moduleName: "@bobbyfidz/cobalt-graphql-schema",
        exportName: "LoadedObjectStep",
    };

    isSyncAndSafe = true;

    #properties = new Set<PropertyApiName>();

    #parentStepId: number;
    #loadStepId: number;

    constructor($parent: Step, $load: Step) {
        super();
        this.#parentStepId = this.addDependency($parent);
        this.#loadStepId = this.addDependency($load);
    }

    get(property: PropertyApiName) {
        this.#properties.add(property);
        return access(this, property);
    }

    optimize() {
        const $load = this.getDep(this.#loadStepId);
        assert(
            $load instanceof ObjectListStep,
            `LoadedObjectStep could not find its associated ObjectListStep, instead found ${$load}.`
        );
        $load.addProperties(this.#properties);

        const $parent = this.getDep(this.#parentStepId);
        return $parent;
    }
}

class ObjectListStep extends Step<ObjectListStepData> {
    static $$export = {
        moduleName: "@bobbyfidz/cobalt-graphql-schema",
        exportName: "ObjectListStep",
    };

    #properties = new Set<PropertyApiName>();

    #objectType: ObjectTypeV2;
    #contextStepId: number;
    #objectSetStepId: number;
    #pageSizeStepId?: number;
    #pageTokenStepId?: number;

    constructor(objectType: ObjectTypeV2, $objectSet: Step<ObjectSet>) {
        super();
        this.#objectType = objectType;
        this.#contextStepId = this.addUnaryDependency(context());
        this.#objectSetStepId = this.addDependency($objectSet);
        // TODO: first/after/orderBy args
    }

    addProperties(properties: Set<PropertyApiName>) {
        properties.forEach((property) => this.#properties.add(property));
    }

    execute({ values, indexMap }: ExecutionDetails): ExecutionResults<ObjectListStepData> {
        return indexMap(async (index) => {
            const context: CobaltGraphQLContext = values[this.#contextStepId]!.at(index);
            const objectSet: ObjectSet = values[this.#objectSetStepId]!.at(index);
            const pageSize = this.#pageSizeStepId ? values[this.#pageSizeStepId]!.at(index) : undefined;
            const pageToken = this.#pageTokenStepId ? values[this.#pageTokenStepId]!.at(index) : undefined;

            const { data, nextPageToken } = await OntologyObjectSets.load(
                context.client,
                context.ontologyRid,
                {
                    objectSet,
                    select: Array.from(this.#properties) as SelectedPropertyApiName[],
                    pageSize,
                    pageToken,
                    excludeRid: true,
                }
            );

            return {
                data: data.map((object) => ({
                    $objectType: this.#objectType,
                    ...object,
                })),
                nextPageToken,
            } satisfies ObjectListStepData;
        });
    }

    items(): Step<TypedOntologyObject[]> {
        return access(this, "data");
    }

    nextPageToken(): Step<string | undefined> {
        return access(this, "nextPageToken");
    }
}

export function objectListConnection(objectType: ObjectTypeV2, $objectSet: Step<ObjectSet>) {
    const objectListStep = new ObjectListStep(objectType, $objectSet);
    return object({
        pageInfo: object({
            hasNextPage: lambda(objectListStep.nextPageToken(), (pageToken) => pageToken !== undefined, true),
            endCursor: objectListStep.nextPageToken(),
        }),
        edges: each(objectListStep.items(), (item) =>
            object({
                node: new LoadedObjectStep(item, objectListStep),
            })
        ),
    });
}
