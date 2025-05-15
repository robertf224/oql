import { ontologyMetadataApi } from "@bobbyfidz/oms";
import { PropertyApiName, PropertyTypeRid } from "@osdk/foundry.ontologies";
import { ObjectTypeApiName } from "@osdk/foundry.ontologies";

export type UserProperties = Record<
    PropertyTypeRid,
    { objectTypeApiName: ObjectTypeApiName; propertyApiName: PropertyApiName }
>;

export function getUserProperties(privateApiObjectTypes: ontologyMetadataApi.IObjectType[]): UserProperties {
    return Object.fromEntries(
        privateApiObjectTypes.flatMap((objectType) =>
            Object.values(objectType.propertyTypes)
                .filter(
                    (property) =>
                        property.baseFormatter?.type === "knownFormatter" &&
                        property.baseFormatter.knownFormatter.type === "userId"
                )
                .map((property) => [
                    property.rid,
                    { objectTypeApiName: objectType.apiName!, propertyApiName: property.apiName! },
                ])
        )
    );
}
