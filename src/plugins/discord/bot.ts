import {
	ApplicationCommandDataResolvable,
	Client,
	Collection,
	Events,
	Interaction,
	REST,
	Routes,
} from 'discord.js';
import { FastifyInstance } from 'fastify';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import type Command from './interfaces/commands';

export class Bot {
	public commands = new Collection<string, Command>();
	public slashCommands = new Array<ApplicationCommandDataResolvable>();
	public slashCommandsMap = new Collection<string, Command>();

	public constructor(public readonly server: FastifyInstance) {
		this.server.discord.login(this.server.config.DISCORD_TOKEN);

		this.server.discord.on('ready', () => {
			this.server.log.info(`${this.server.discord.user?.username} ready!`);

			this.registerSlashCommands();
		});

		this.server.discord.on('warn', (info) => this.server.log.warn(info));

		this.server.discord.on('error', this.server.log.error);

		this.onInteractionCreate();
	}

	private async registerSlashCommands() {
		const rest = new REST({ version: '10' }).setToken(
			this.server.config.DISCORD_TOKEN,
		);
		const commandFiles = readdirSync(join(__dirname, 'commands'));
		this.server.log.info(`Adding ${commandFiles.length} commands.`);
		for (const file of commandFiles) {
			const command = (await import(join(__dirname, 'commands', file))) as {
				default: Command;
			};
			if (!command) {
				throw new Error(`Unable to load command from file ${file}`);
			}
			console.log(command);
			this.slashCommands.push(command.default.data);
			this.slashCommandsMap.set(command.default.data.name, command.default);
		}

		const result = (await rest.put(
			Routes.applicationCommands(this.server.discord.user!.id),
			{
				body: this.slashCommands,
			},
		)) as unknown[];

		this.server.log.debug(result);
		this.server.log.info(`Added ${result.length} commands successfully.`);
	}

	private async onInteractionCreate() {
		this.server.discord.on(
			Events.InteractionCreate,
			async (interaction: Interaction): Promise<any> => {
				if (!interaction.isChatInputCommand()) return;

				const command = this.slashCommandsMap.get(interaction.commandName);

				if (!command) return;

				this.server.log.info(`Received command '${interaction.commandName}'.`);

				try {
					await command.execute(this.server, interaction);
				} catch (e) {
					this.server.log.error(e);
					interaction
						.reply({
							content: 'Something went wrong with this command.',
							ephemeral: true,
						})
						.catch(this.server.log.error);
				}
			},
		);
	}
}
