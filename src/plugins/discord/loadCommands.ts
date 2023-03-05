import { Collection } from 'discord.js';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { FastifyInstance } from 'fastify';
import type Command from './interfaces/commands';

export async function loadCommands(fastify: FastifyInstance) {
	const commands = new Collection<string, Command>();
	const commandFiles = await readdir(join(__dirname, 'commands'));

	for (const file of commandFiles) {
		const filePath = join(__dirname, 'command', file);
		const command: Command = await import(filePath);
		if ('data' in command && 'execute' in command) {
			commands.set(command.data.name, command);
		} else {
			fastify.log.warn(
				`The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}

	return commands;
}
