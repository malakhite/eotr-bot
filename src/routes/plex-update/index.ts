import { FastifyInstance, RouteOptions } from 'fastify';
import multer from 'fastify-multer';
import { Static, Type } from '@sinclair/typebox';
import fp from 'fastify-plugin';
import { TextChannel } from 'discord.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// const Message = Type.Object({
//   payload: Type.Object({
//     event: Type.String(),
//     user: Type.Boolean(),
//     owner: Type.Boolean(),
//     Account: Type.Object({
//       id: Type.Number(),
//       thumb: Type.Optional(Type.String({ format: 'uri' })),
//       title: Type.String(),
//     }),
//     Server: Type.Object({
//       title: Type.String(),
//       uuid: Type.String({ format: 'uuid' }),
//     }),
//     Player: Type.Object({
//       local: Type.Boolean(),
//       publicAddress: Type.String({ format: 'ipv4' }),
//       title: Type.String(),
//       uuid: Type.String({ format: 'uuid' }),
//     }),
//     Metadata: Type.Object({
//       librarySectionType: Type.String(),
//       ratingKey: Type.String(),
//       key: Type.String(),
//       grandparentRatingKey: Type.String(),
//       guid: Type.String(),
//       librarySectionId: Type.Number(),
//       type: Type.String(),
//       title: Type.String(),
//       grandparentKey: Type.String(),
//       parentKey: Type.String(),
//       grandparentTitle: Type.String(),
//       parentTitle: Type.String(),
//       summary: Type.String(),
//       index: Type.Number(),
//       parentIndex: Type.Number(),
//       thumb: Type.String(),
//       art: Type.String(),
//       parentThumb: Type.String(),
//       grandparentThumb: Type.String(),
//       grandparentArt: Type.String(),
//       addedAt: Type.Number(),
//       updatedAt: Type.Number(),
//     }),
//   }),
// });

const Message = Type.Object({
  payload: Type.String(),
});
export type MessageType = Static<typeof Message>;

const { DISCORD_PLEX_CHANNEL } = process.env;

async function handleUpdate(fastify: FastifyInstance) {
  fastify.route<{ Body: MessageType }>({
    method: 'POST',
    url: '/updates',
    // schema: { body: Message },
    preHandler: upload.single('thumb'),
    handler: async (request, response) => {
      const payload = JSON.parse(request.body.payload);
      if (payload.event === 'library.new') {
        const client = fastify.discord;
        // const guild = client.guilds.cache.get(DISCORD_GUILD_ID!);
        // const channel = guild?.channels.cache.get(DISCORD_PLEX_CHANNEL!) as TextChannel;
        const channel = client.channels.cache.get(
          DISCORD_PLEX_CHANNEL!
        ) as TextChannel;
        if (payload.Metadata.librarySectionType === 'show') {
          channel.send(
            `${payload.Metadata.grandparentTitle} - ${payload.Metadata.parentTitle} - ${payload.Metadata.title} has been added`
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
