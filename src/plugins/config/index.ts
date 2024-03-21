import dotenv from 'dotenv';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { parseEnv } from 'znv';
import { z } from 'zod';

declare module 'fastify' {
	interface FastifyInstance {
		config: typeof config;
	}
}

dotenv.config();

const env = parseEnv(process.env, {
	PORT: z.number().default(8080),
	HOST: z.string().default('0.0.0.0'),
	DISCORD_TOKEN: z.string(),
	DISCORD_APP_ID: z.string(),
	DISCORD_GUILD_ID: z.string(),
	DISCORD_OPTIONAL_CATEGORY_ID: z.string(),
	DISCORD_PLEX_CHANNEL: z.string(),
	DISCORD_UPDATES_CHANNEL: z.string(),
	DISCORD_WORD_GAMES_CHANNEL: z.string(),
	DISCORD_WORD_GAMES_SCHEDULE: z.string(),
	LOCAL_TIMEZONE: z.string(),
	TWITCH_CLIENT_ID: z.string(),
	TWITCH_CLIENT_SECRET: z.string(),
	TWITCH_LOCAL_SECRET: z.string(),
	ENABLE_TWITCH: z.coerce.boolean().default(false),
});

const config = {
	...env,
	TWITCH_USER_IDS: ['72535319'],
};

async function configPlugin(fastify: FastifyInstance) {
	if (!fastify.config) {
		fastify.decorate('config', config);
	}
}

export default fp(configPlugin);
