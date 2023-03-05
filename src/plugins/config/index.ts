import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { parseEnv } from 'znv';
import { z } from 'zod';

declare module 'fastify' {
	interface FastifyInstance {
		config: typeof config;
	}
}

const config = parseEnv(process.env, {
	PORT: z.number().default(8080),
	HOST: z.string().default('0.0.0.0'),
	DISCORD_TOKEN: z.string(),
	DISCORD_APP_ID: z.string(),
	DISCORD_GUILD_ID: z.string(),
	DISCORD_OPTIONAL_CATEGORY_ID: z.string(),
	DISCORD_PLEX_CHANNEL: z.string(),
});

async function configPlugin(fastify: FastifyInstance) {
	if (!fastify.config) {
		fastify.decorate('config', config);
	}
}

export default fp(configPlugin);
