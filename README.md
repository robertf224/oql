# oql

Build robust frontends for Palantir Foundry.

## Plan

Basically making [this](https://bobbyfidz.tech/posts/client-state-management#the-ideal-application-framework) real.

Pathing:

- Create an initial GraphQL schema and execution over Foundry's API (goql). Basically will be user-defined Ontology + Users. This will provide immediate compatibility with robust GraphQL client frameworks like Relay.
- Build some initial goql-based components.
- Create a new query format (oql) and incremental execution engine. Will be GraphQL-shaped (returned data will match shape of query) but will have first-class filters/sorts/joins.
- Swap out goql execution to instead compile to oql and execute that.
