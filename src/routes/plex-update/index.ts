import { FastifyInstance, RouteOptions } from 'fastify';
import multer from 'fastify-multer';
import { Static, Type } from '@sinclair/typebox';
import fp from 'fastify-plugin';
import { TextChannel } from 'discord.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const ParsedMessage = Type.Object({
  event: Type.String(),
  user: Type.Boolean(),
  owner: Type.Boolean(),
  Account: Type.Object({
    id: Type.Number(),
    thumb: Type.Optional(Type.String({ format: 'uri' })),
    title: Type.String(),
  }),
  Server: Type.Object({
    title: Type.String(),
    uuid: Type.String({ format: 'uuid' }),
  }),
  Player: Type.Object({
    local: Type.Boolean(),
    publicAddress: Type.String({ format: 'ipv4' }),
    title: Type.String(),
    uuid: Type.String({ format: 'uuid' }),
  }),
  Metadata: Type.Object({
    librarySectionType: Type.String(),
    ratingKey: Type.String(),
    key: Type.String(),
    grandparentRatingKey: Type.String(),
    guid: Type.String(),
    librarySectionId: Type.Number(),
    type: Type.String(),
    title: Type.String(),
    grandparentKey: Type.String(),
    parentKey: Type.String(),
    grandparentTitle: Type.String(),
    parentTitle: Type.String(),
    summary: Type.String(),
    index: Type.Number(),
    parentIndex: Type.Number(),
    thumb: Type.String(),
    art: Type.String(),
    parentThumb: Type.String(),
    grandparentThumb: Type.String(),
    grandparentArt: Type.String(),
    addedAt: Type.Number(),
    updatedAt: Type.Number(),
  }),
});

const Message = Type.Object({
  payload: Type.String(),
});

export type MessageType = Static<typeof Message>;
export type ParsedMessageType = Static<typeof ParsedMessage>;

const { DISCORD_PLEX_CHANNEL } = process.env;

async function handleUpdate(fastify: FastifyInstance) {
  fastify.route<{ Body: MessageType }>({
    method: 'POST',
    url: '/updates',
    preHandler: upload.single('thumb'),
    handler: async (request, response) => {
      const payload = JSON.parse(request.body.payload) as ParsedMessageType;
      fastify.log.info({ type: 'incoming-request', payload });
      if (payload.event === 'library.new') {
        const client = fastify.discord;
        const channel = client.channels.cache.get(
          DISCORD_PLEX_CHANNEL!
        ) as TextChannel;
        if (payload.Metadata.librarySectionType === 'show') {
          channel.send(
            `${[
              payload.Metadata.grandparentTitle,
              payload.Metadata.parentTitle,
              payload.Metadata.title,
            ]
              .filter((item) => !!item)
              .join(' - ')} has been added`
          );
        }
        if (payload.Metadata.librarySectionType === 'movie') {
          channel.send(`${payload.Metadata.title} has been added`);
        }
      }
      response.send();
    },
  });
}

export default fp(handleUpdate);
