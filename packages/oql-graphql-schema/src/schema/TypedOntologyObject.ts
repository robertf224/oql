import { ObjectTypeV2, OntologyObjectV2 } from "@osdk/foundry.ontologies";

export interface TypedOntologyObject extends OntologyObjectV2 {
    $objectType: ObjectTypeV2;
}
