import 'dotenv/config';
import * as Fastify from 'fastify';
import fm from 'fastify-multipart';
import discordPlugin from './plugins/discord';
import handleUpdate, { MessageType } from './routes/plex-update';

const { PORT = 8080 } = process.env;

const server = Fastify.fastify({ logger: { level: 'info' } });

server.register(handleUpdate);
server.register(discordPlugin);
server.register(fm, { attachFieldsToBody: true });

server.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
