import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Discord, { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './bot';

declare module 'fastify' {
	interface FastifyInstance {
		discord: Client;
	}
}

async function discordPlugin(fastify: FastifyInstance) {
	const client = new Discord.Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
		],
	});

	fastify.addHook('onClose', (instance, done) => {
		client.destroy();
		done();
	});

	if (!fastify.discord) {
		fastify.decorate('discord', client);
	}

	const bot = new Bot(fastify);
}

export default fp(discordPlugin);
