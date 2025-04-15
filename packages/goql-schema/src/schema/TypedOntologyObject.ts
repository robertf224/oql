import { ObjectRid, ObjectTypeApiName, OntologyObjectV2, PrimaryKeyValue } from "@osdk/foundry.ontologies";

export interface TypedOntologyObject extends OntologyObjectV2 {
    __apiName: ObjectTypeApiName;
    __rid?: ObjectRid;
    __primaryKey: PrimaryKeyValue;
    __title: string;
}
