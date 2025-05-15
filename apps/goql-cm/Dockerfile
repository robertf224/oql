ARG NODE_VERSION=20.18.2

FROM node:${NODE_VERSION} AS base
 
# Prune the repo.
FROM base AS setup
WORKDIR /app
RUN npm install -g pnpm@9.6.0
COPY . .
RUN pnpm turbo prune @bobbyfidz/goql-cm --docker
 
# Install dependencies and build.
FROM base AS build
WORKDIR /app
RUN npm install -g pnpm@9.6.0
COPY --from=setup /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=setup /app/out/full/ .
RUN pnpm turbo run build
 
# Run the app.
FROM base AS run
WORKDIR /app
COPY --from=build /app ./
WORKDIR /app/apps/goql-cm
USER 5000
CMD ["node", "./lib/index.js"]