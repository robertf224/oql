import { Users } from "@osdk/foundry.admin";
import { PrincipalId } from "@osdk/foundry.core";
import { loadOneCallback } from "grafast";
import { GoqlContext } from "../context.js";

// TODO: put this into a shared code-split utility library.
async function responseToDataURL(response: Response): Promise<string> {
    if (typeof window === "undefined") {
        const contentType = response.headers.get("content-type") ?? "application/octet-stream";
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        return `data:${contentType};base64,${base64}`;
    } else {
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

export const UserProfilePictureLoader = loadOneCallback<PrincipalId, string, {}, GoqlContext>(
    async (ids, { unary: context }) => {
        return Promise.all(ids.map((id) => Users.profilePicture(context.client, id).then(responseToDataURL)));
    }
);
