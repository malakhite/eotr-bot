import { HttpService } from '@nestjs/axios';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import {
	ActionRowBuilder,
	APIEmbedField,
	Client,
	EmbedBuilder,
	GuildMemberRoleManager,
	Role,
	RoleSelectMenuBuilder,
	TextChannel,
	ThreadAutoArchiveDuration,
} from 'discord.js';
import {
	Context,
	ISelectedRoles,
	Options,
	RoleSelect,
	RoleSelectContext,
	SelectedRoles,
	SlashCommand,
	SlashCommandContext,
} from 'necord';

import { MusicDto } from './music.dto';
import { RollDto } from './roll.dto';

import { SELF_ASSIGNABLE_ROLES } from '../constants';
import dayjs from '../lib/date-time';
import { SonglinkService } from '../music/songlink.service';

@Injectable()
export class DiscordService {
	private readonly logger = new Logger(DiscordService.name);

	private readonly wordgames = [
		{
			game: 'Wordle',
			startDate: dayjs('2021-06-20').startOf('day'),
			url: 'https://www.nytimes.com/games/wordle',
		},
		{
			game: 'Connections',
			startDate: dayjs('2023-06-12').startOf('day'),
			url: 'https://www.nytimes.com/games/connections',
		},
		{
			game: 'Strands',
			startDate: dayjs('2024-03-04').startOf('day'),
			url: 'https://www.nytimes.com/games/strands',
		},
	];
	private readonly wordgame_titles = this.wordgames.map((game) => game.game);

	constructor(
		private readonly discordClient: Client,
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
		private readonly songlinkService: SonglinkService,
	) {}

	@SlashCommand({
		name: 'music',
		description: 'Search for music streaming sources.',
	})
	public async music(
		@Context()
		[interaction]: SlashCommandContext,

		@Options()
		{ url }: MusicDto,
	) {
		await interaction.deferReply();

		try {
			const songServiceResponse = await this.songlinkService.getSongByUrl(url);

			const links: APIEmbedField[] = songServiceResponse.services.map(
				(service) => {
					return {
						name: service.service,
						value: service.url,
					};
				},
			);

			const embeds = [
				new EmbedBuilder()
					.setTitle(
						`${songServiceResponse.title} by ${songServiceResponse.artist}`,
					)
					.setThumbnail(songServiceResponse.cover)
					.addFields(...links),
			];

			return interaction.editReply({ embeds });
		} catch (e) {
			this.logger.error(e);
			return interaction.editReply(`I'm sorry, but I can't find that track.`);
		}
	}

	@SlashCommand({
		name: 'roll',
		description: 'Roll a wisdom check!',
	})
	public roll(
		@Context()
		[interaction]: SlashCommandContext,

		@Options()
		{ count, sides }: RollDto,
	) {
		const { dice, total } = this.rollDice(count, sides);

		this.logger.debug({ msg: 'Dice roll', dice, total });

		const embed = new EmbedBuilder()
			.setTitle('Roll result')
			.setDescription(`Rolled ${count}D${sides}`)
			.addFields(
				{ name: 'Die rolls', value: dice.join(', ') },
				{ name: 'Total', value: total.toString() },
			);

		return interaction.reply({ embeds: [embed] });
	}

	@SlashCommand({
		name: 'roles',
		description: 'Add and remove yourself from notification roles.',
	})
	public roles(
		@Context()
		[interaction]: SlashCommandContext,
	) {
		const roleSelect = new RoleSelectMenuBuilder()
			.setCustomId('SELF_ASSIGN_ROLES')
			.setPlaceholder('Select roles')
			.setMinValues(0)
			.setMaxValues(25)
			.addDefaultRoles();

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
			roleSelect,
		);

		return interaction.reply({ components: [row], ephemeral: true });
	}

	@RoleSelect('SELF_ASSIGN_ROLES')
	public async onRoleSelect(
		@Context()
		[interaction]: RoleSelectContext,

		@SelectedRoles()
		roles: ISelectedRoles,
	) {
		const selectedRoles = roles.filter((role) => role instanceof Role);
		const roleManger = interaction.member.roles;

		if (roleManger instanceof GuildMemberRoleManager) {
			SELF_ASSIGNABLE_ROLES.forEach((role) => {
				if (selectedRoles.has(role)) {
					roleManger.add(role);
				} else {
					roleManger.remove(role);
				}
			});
		}

		return interaction.reply('Successfully updated roles.');
	}

	@Cron('59 23 * * *', {
		timeZone: 'America/New_York',
	})
	private async handleWordGameThreads() {
		const today = dayjs().tz(this.configService.get('LOCAL_TIMEZONE'));
		const tomorrow = today.add(1, 'day');
		const channel = this.discordClient.channels.cache.get(
			this.configService.get('DISCORD_WORD_GAMES_CHANNEL'),
		);
		if (!(channel instanceof TextChannel)) {
			throw new InternalServerErrorException(
				`${this.configService.get('DISCORD_WORD_GAMES_CHANNEL')} is not a text channel.`,
			);
		}

		channel.threads.cache
			.filter((thread) => {
				const [game] = thread.name.split(' ');
				return this.wordgame_titles.includes(game);
			})
			.forEach(async (thread) => {
				await thread.setArchived();
			});

		for await (const game of this.wordgames) {
			const gameNumber = Math.floor(
				dayjs.duration(tomorrow.diff(game.startDate)).asDays(),
			);
			const threadName = `${game.game} ${gameNumber.toLocaleString()} - ${tomorrow.format('DD MMM YYYY')}`;
			const thread = await channel.threads.create({
				name: threadName,
				autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
				reason: game.url,
			});
			await thread.send(game.url);
		}
	}

	private rollDice(count: number, sides: number) {
		const dice = Array.from(new Array(count)).map(() =>
			Math.floor(Math.random() * sides + 1),
		);
		const total = dice.reduce((acc, curr) => {
			return (acc += curr);
		}, 0);

		return { dice, total };
	}
}
