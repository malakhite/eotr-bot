import * as Fastify from 'fastify';
import multer from 'fastify-multer';
import fe from '@fastify/express';
import config from './plugins/config';
import discordPlugin from './plugins/discord';
import handleUpdate from './routes/plex-update';
import { fastifySchedule } from '@fastify/schedule';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { createLiveHandler } from 'lib/twitch';

(async function main() {
	const server = Fastify.fastify({
		logger: { level: process.env.LOG_LEVEL || 'info' },
	});

	await server.register(fe);
	await server.register(config);
	await server.register(fastifySchedule);
	await server.register(handleUpdate);
	await server.register(discordPlugin);
	await server.register(multer.contentParser);

	const authProvider = new AppTokenAuthProvider(
		server.config.TWITCH_CLIENT_ID,
		server.config.TWITCH_CLIENT_SECRET,
	);

	const apiClient = new ApiClient({ authProvider });

	const twitchMiddleware = new EventSubMiddleware({
		apiClient,
		hostName: 'eb.scottabbey.com',
		pathPrefix: '/webhooks/twitch',
		secret: server.config.TWITCH_LOCAL_SECRET,
	});
	twitchMiddleware.apply(server.express);

	server.listen(
		{
			host: server.config.HOST,
			port: server.config.PORT,
		},
		async (err, _address) => {
			if (err) {
				server.log.error(err);
				process.exit(1);
			}

			await twitchMiddleware.markAsReady();
			const liveHandler = createLiveHandler(server);
			server.config.TWITCH_USER_IDS.forEach((userId) => {
				twitchMiddleware.onStreamOnline(userId, liveHandler);
			});
		},
	);
})();
