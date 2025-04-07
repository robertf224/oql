import base from "@valinor-enterprises/universal-build-config/eslint-base.mjs";

export default [
    ...base,
    {
        rules: {
            "license-header/header": false,
        },
    },
];
