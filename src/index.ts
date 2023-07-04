import * as Fastify from 'fastify';
import multer from 'fastify-multer';
import config from './plugins/config';
import discordPlugin from './plugins/discord';
import handleUpdate from './routes/plex-update';

(async function main() {
	const server = Fastify.fastify({
		logger: { level: process.env.LOG_LEVEL || 'info' },
	});

	await server.register(config);
	await server.register(handleUpdate);
	await server.register(discordPlugin);
	await server.register(multer.contentParser);

	server.listen(
		{
			host: server.config.HOST,
			port: server.config.PORT,
		},
		(err, _address) => {
			if (err) {
				server.log.error(err);
				process.exit(1);
			}
		},
	);
})();
