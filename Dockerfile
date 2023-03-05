FROM node:lts-alpine AS builder
WORKDIR /var/app
COPY [ "package.json", "pnpm-lock.yaml", "./" ]
RUN [ "pnpm", "install", "--frozen-lockfile" ]
COPY [ "./", "./" ]
RUN [ "pnpm", "build" ]

FROM node:lts-alpine
WORKDIR /var/app
COPY [ "package.json", "pnpm-lock.yaml", "./" ]
ENTRYPOINT [ "pnpm", "start" ]
ENV NODE_ENV production
RUN [ "pnpm", "install", "--frozen-lockfile" ]
COPY --from=builder [ "/var/app/dist", "./dist" ]