import {
	APIEmbedField,
	EmbedBuilder,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { FastifyInstance } from 'fastify';
import * as rm from 'typed-rest-client';
import { SONGWHIP_URL } from '../../../config/music';
import type Command from '../interfaces/commands';
import type { MusicProvider, SongwhipResponse } from '../interfaces/music';

type OurProviders = Extract<
	MusicProvider,
	'itunes' | 'amazonMusic' | 'spotify' | 'tidal' | 'youtube' | 'youtubeMusic'
>;

const reportableServices: Record<OurProviders, string> = {
	amazonMusic: 'Amazon Music',
	itunes: 'Apple Music',
	spotify: 'Spotify',
	tidal: 'Tidal',
	youtube: 'YouTube',
	youtubeMusic: 'YouTube Music',
};

async function handleMusic(url: URL, server: FastifyInstance) {
	const songwhipClient = new rm.RestClient('music-fetcher', SONGWHIP_URL);
	const payload = {
		url: url.toString(),
		country: 'US',
	};

	server.log.info({
		type: 'outgoing-request',
		path: `${SONGWHIP_URL}api`,
		payload,
	});

	const response = await songwhipClient.create<SongwhipResponse>(
		'api',
		payload,
	);

	if (response.result?.status !== 'success') {
		server.log.error(response);
	} else {
		const {
			result: {
				data: {
					item: {
						name: track,
						url: songwhipUrl,
						links: linkResults,
						artists: [{ name: artist }],
					},
				},
			},
		} = response;

		const links = Object.keys(reportableServices).reduce((acc, service) => {
			if (linkResults[service as OurProviders]) {
				const result = linkResults[service as OurProviders]!;
				if (result.length && result.length > 0) {
					acc.push(
						...result.map((source) => ({
							name: reportableServices[service as OurProviders],
							value: source.link.replaceAll('{country}', 'US'),
						})),
					);
				}
			}

			return acc;
		}, [] as APIEmbedField[]);

		const sources = new EmbedBuilder()
			.setTitle(`${track} by ${artist}`)
			.setURL(`https://songwhip.com${songwhipUrl}`)
			.addFields(...links);

		return [sources];
	}
}

const music: Command = {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Search for music streaming sources.')
		.addStringOption((option) => {
			return option
				.setName('url')
				.setDescription('The URL of a music streaming source.')
				.setRequired(true);
		}),
	execute: async function execute(server, interaction) {
		const url = interaction.options.getString('url');
		if (!url) {
			throw new Error('No URL entered.');
		}
		await interaction.deferReply();
		const embeds = await handleMusic(new URL(url), server);
		if (embeds && interaction.channel instanceof TextChannel) {
			return interaction.editReply({ embeds });
		}
		return interaction.editReply({
			content: 'No other sources found.',
		});
	},
};

export default music;
