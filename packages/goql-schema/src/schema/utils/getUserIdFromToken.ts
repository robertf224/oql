import { PrincipalId } from "@osdk/foundry.core";
import { decodeJwt } from "jose";
import { assert } from "@valinor-enterprises/assertions";

export function getUserIdFromToken(token: string): PrincipalId {
    const { sub } = decodeJwt(token);
    assert(sub, "Expected a sub claim in the token.");
    const binaryString = atob(sub);
    let hex = "";
    for (let i = 0; i < binaryString.length; i++) {
        hex += binaryString.charCodeAt(i).toString(16).padStart(2, "0");
    }
    assert(hex.length === 32, "Expected 16 bytes of data.");
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}` as PrincipalId;
}
