FROM node:lts-alpine AS builder
WORKDIR /var/app/
COPY [ "package.json", "yarn.lock", "./" ]
RUN [ "yarn", "install", "--frozen-lockfile" ]
COPY [ "src", "./src/" ]
RUN [ "yarn", "build" ]
RUN [ "yarn", "release" ]

FROM node:lts-alpine
WORKDIR /var/app
COPY --from=builder [ "package.json", "yarn.lock", "./" ]
ENTRYPOINT [ "node", "dist/main.js" ]
ENV NODE_ENV production
RUN [ "yarn", "install", "--frozen-lockfile" ]
COPY --from=builder [ "/var/app/dist", "./dist/" ]