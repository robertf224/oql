import { Client } from "@osdk/client";
import { DefaultHttpApiBridge } from "conjure-client";

interface ConjureClient<T> {
    new (httpApiBridge: DefaultHttpApiBridge): T;
}

function getHttpApiBridge(client: Client, path: string) {
    const { baseUrl, tokenProvider, fetch } = client.__osdkClientContext;
    return new DefaultHttpApiBridge({
        baseUrl: new URL(baseUrl).origin + path,
        userAgent: {
            productName: "goql",
            productVersion: "0.0.0",
        },
        token: tokenProvider,
        fetch,
    });
}

export function getConjureClient<T>(client: Client, service: ConjureClient<T>, path: string): T {
    const httpApiBridge = getHttpApiBridge(client, path);
    return new service(httpApiBridge);
}
