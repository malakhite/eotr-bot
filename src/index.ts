import 'dotenv/config';
import * as Fastify from 'fastify';
import toString from 'stream-to-string';
import discordPlugin from './plugins/discord';
import handleUpdate from './routes/plex-update';

const { PORT = 8080 } = process.env;

const server = Fastify.fastify({ logger: { level: 'info' } });

server.route(handleUpdate);
server.register(discordPlugin);

server.addContentTypeParser('multipart/form-data', async function (
  req: Fastify.FastifyRequest,
  payload: Fastify.RawRequestDefaultExpression
) {
  const body = await toString(payload);
  console.log(body);
  const json = JSON.parse(body);
  return json;
} as Fastify.FastifyContentTypeParser);

server.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
