import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Discord, { Client } from 'discord.js';

import handleMessage from './handleMessage';

const { DISCORD_TOKEN } = process.env;

declare module 'fastify' {
  interface FastifyInstance {
    discord: Client;
  }
}

async function discordPlugin(fastify: FastifyInstance) {
  const client = new Discord.Client();

  client.on('ready', () => {
    fastify.log.info(`connected to Discord as ${client.user?.tag}`);
  });

  client.on('message', (msg) => handleMessage(msg, fastify));
  client.on('disconnect', () => {
    fastify.log.warn('disconnected from Discord');
  });

  client.login(DISCORD_TOKEN);

  if (!fastify.discord) {
    fastify.decorate('discord', client);
  }
}

export default fp(discordPlugin);
