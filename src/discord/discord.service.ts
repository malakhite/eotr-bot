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
import { catchError, firstValueFrom } from 'rxjs';

import { MusicDto } from './music.dto';
import { RollDto } from './roll.dto';

import { SELF_ASSIGNABLE_ROLES } from '../constants';
import dayjs from '../lib/date-time';

import type { MusicProvider, SongwhipResponse } from './music.interface';
import type { AxiosError } from 'axios';

type OurProviders = Extract<
	MusicProvider,
	'itunes' | 'amazonMusic' | 'spotify' | 'tidal' | 'youtube' | 'youtubeMusic'
>;

@Injectable()
export class DiscordService {
	private readonly logger = new Logger(DiscordService.name);
	private readonly songwhipUrl = 'https://songwhip.com/';
	private readonly ourServices: Record<OurProviders, string> = {
		amazonMusic: 'Amazon Music',
		itunes: 'Apple Music',
		spotify: 'Spotify',
		tidal: 'Tidal',
		youtube: 'YouTube',
		youtubeMusic: 'YouTube Music',
	};
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

		const songwhipApi = new URL('api', this.songwhipUrl);

		const { data } = await firstValueFrom(
			this.httpService
				.post<SongwhipResponse>(songwhipApi.toString(), {
					url,
					country: 'US',
				})
				.pipe(
					catchError((error: AxiosError) => {
						this.logger.error(error.response.data);
						throw error.message;
					}),
				),
		);

		if (data.status !== 'success') {
			this.logger.error(data);
			return interaction.editReply(
				"Sorry, I'm unable to complete this request.",
			);
		}

		const {
			data: {
				item: {
					name: track,
					image,
					url: songwhipUrl,
					links: linkResults,
					artists: [{ name: artist }],
				},
			},
		} = data;

		const links = Object.keys(this.ourServices).reduce((acc, service) => {
			if (linkResults[service as OurProviders]) {
				const result = linkResults[service as OurProviders]!;
				if (result.length && result.length > 0) {
					acc.push(
						...result.map((source) => ({
							name: this.ourServices[service as OurProviders],
							value: source.link.replaceAll('{country}', 'US'),
						})),
					);
				}
			}

			return acc;
		}, [] as APIEmbedField[]);

		const embeds = [
			new EmbedBuilder()
				.setTitle(`${track} by ${artist}`)
				.setThumbnail(image)
				.setURL(`https://songwhip.com${songwhipUrl}`)
				.addFields(...links),
		];

		return interaction.editReply({ embeds });
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
			.addDefaultRoles(SELF_ASSIGNABLE_ROLES);

		const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
			roleSelect,
		);

		return interaction.reply({ components: [row] });
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
