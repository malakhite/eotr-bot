FROM node:lts-alpine AS builder
WORKDIR /var/app
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY [ "package.json", "pnpm-lock.yaml", "./" ]
RUN pnpm install --frozen-lockfile && npm install -g nest
COPY [ "./", "./" ]
RUN pnpm build

FROM node:lts-alpine
WORKDIR /var/app

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate
COPY [ "package.json", "pnpm-lock.yaml", "./" ]

ENV NODE_ENV production
RUN pnpm install --frozen-lockfile && npm install -g nest
COPY --from=builder [ "/var/app/dist", "./dist" ]

ENTRYPOINT node dist/main.js
