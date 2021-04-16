import { FastifyInstance, RouteOptions } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import toString from 'stream-to-string';

const Message = Type.Object({
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
export type MessageType = Static<typeof Message>;

const { DISCORD_PLEX_CHANNEL } = process.env;

// const handleUpdate = {
//   method: 'POST',
//   url: '/updates',
//   schema: {
//     body: Message,
//   },
//   handler: async function (request, reply) {
//     const client = this.discord;
//     const {
//       body: { payload, thumb },
//     } = request;
//     this.log.info(body);
//   },
// } as RouteOptions;

// export default handleUpdate;

const handleUpdate = (fastify: FastifyInstance) => {
  fastify.post<{ Body: MessageType }>(
    '/updates',
    { schema: { body: Message } },
    async (request, response) => {
      const { body } = request;
      console.log(body);
    }
  );
};

export default handleUpdate;
