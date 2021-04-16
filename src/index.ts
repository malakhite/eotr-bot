import 'dotenv/config';
import * as Fastify from 'fastify';
import discordPlugin from './plugins/discord';
import handleUpdate from './routes/plex-update';

const { PORT = 8080 } = process.env;

const server = Fastify.fastify({ logger: { level: 'info' } });

server.route(handleUpdate);
server.register(discordPlugin);

server.addContentTypeParser(
  'multipart/form-data',
  { parseAs: 'string' },
  function (req, body, done) {
    const json = JSON.parse(body as string);
    done(null, json);
  }
);

server.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
