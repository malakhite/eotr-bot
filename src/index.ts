import 'dotenv/config';
import * as Fastify from 'fastify';
import discordPlugin from './plugins/discord';
import handleUpdate from './routes/plex-update';

const { PORT = 8080 } = process.env;

const server = Fastify.fastify({ logger: { level: 'info' } });

server.route(handleUpdate);
server.register(discordPlugin);

server.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
