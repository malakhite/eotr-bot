import {
	ApplicationCommandDataResolvable,
	Collection,
	Events,
	Interaction,
	REST,
	Routes,
	TextChannel,
} from 'discord.js';
import { FastifyInstance } from 'fastify';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import type Command from './interfaces/commands';
import { WORDGAMES } from '../../constants';
import dayjs from '../../lib/date-time';
import { AsyncTask, CronJob, Task } from 'toad-scheduler';

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

		WORDGAMES.forEach((game) => {
			const createThreadTask = new Task(`create ${game.game} thread`, () => {
				return this.createWordGameThread(game);
			});
			const createThreadJob = new CronJob(
				{
					cronExpression: this.server.config.DISCORD_WORD_GAMES_SCHEDULE,
					timezone: 'America/New_York',
				},
				createThreadTask,
			);
			this.server.scheduler.addCronJob(createThreadJob);

			const archiveThreadTask = new AsyncTask(
				`archive ${game.game} thread`,
				() => {
					return this.archiveWordGameThread(game);
				},
			);
			const archiveThreadJob = new CronJob(
				{
					cronExpression: this.server.config.DISCORD_WORD_GAMES_SCHEDULE,
					timezone: 'America/New_York',
				},
				archiveThreadTask,
			);
			this.server.scheduler.addCronJob(archiveThreadJob);
		});
	}

	private async registerSlashCommands() {
		const rest = new REST({ version: '10' }).setToken(
			this.server.config.DISCORD_TOKEN,
		);
		const commandFiles = readdirSync(join(__dirname, 'commands'));
		for (const file of commandFiles) {
			const command = (await import(join(__dirname, 'commands', file))) as {
				default: Command;
			};
			if (!command) {
				throw new Error(`Unable to load command from file ${file}`);
			}
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

	private createWordGameThread(game: (typeof WORDGAMES)[number]) {
		const channel = this.server.discord.channels.cache.get(
			this.server.config.DISCORD_WORD_GAMES_CHANNEL,
		);

		if (channel instanceof TextChannel) {
			const tomorrow = dayjs()
				.tz(this.server.config.LOCAL_TIMEZONE)
				.add(1, 'day');
			const name = this.generateWordGameThreadName(game, tomorrow);
			channel.threads.create({
				name,
			});
		}
	}

	private async archiveWordGameThread(game: (typeof WORDGAMES)[number]) {
		const today = dayjs().tz(this.server.config.LOCAL_TIMEZONE);
		const name = this.generateWordGameThreadName(game, today);
		const channel = this.server.discord.channels.cache.get(
			this.server.config.DISCORD_WORD_GAMES_CHANNEL,
		);
		if (channel instanceof TextChannel) {
			const thread = channel.threads.cache.find((t) => t.name === name);
			await thread?.setArchived();
		}
	}

	private generateWordGameThreadName(
		game: (typeof WORDGAMES)[number],
		date: dayjs.Dayjs,
	) {
		const gameNumber = this.calculateWordGameNumber(game, date);
		const name = `${game.game} ${gameNumber} - ${date.format('DD MMMM YYYY')}`;
		this.server.log.debug(`Created thread name for ${game.game}: ${name}`);
		return name;
	}

	private calculateWordGameNumber(
		game: (typeof WORDGAMES)[number],
		date: dayjs.Dayjs,
	) {
		const gameNumber = Math.floor(
			dayjs.duration(date.diff(game.startDate)).asDays(),
		);
		return gameNumber;
	}
}
