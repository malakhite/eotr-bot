import { HttpService } from '@nestjs/axios';
import {
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { firstValueFrom, map, mergeMap } from 'rxjs';

import { PlexUpdateDto } from './plex-update.dto';

import { TVDB_API } from '../constants';

const librarySectionTypeMap = {
	show: 'episode',
};

const grandparentMap = {
	show: 'Series',
};

const parentMap = {
	show: 'Season',
};

@Injectable()
export class PlexService {
	private readonly logger = new Logger(PlexService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly discordClient: Client,
		private readonly httpService: HttpService,
	) {}

	async handleLibraryNew(payload: PlexUpdateDto, secret: string) {
		this.logger.debug(payload);

		if (!this.secretIsValid(secret)) {
			throw new UnauthorizedException();
		}

		const channel = this.discordClient.channels.cache.get(
			this.configService.get('DISCORD_PLEX_CHANNEL'),
		);

		if (!channel.isTextBased()) {
			this.logger.error('DISCORD_PLEX_CHANNEL is not a text channel.');
			throw new InternalServerErrorException();
		}

		const embed = new EmbedBuilder().setTitle(
			`New ${librarySectionTypeMap[payload.Metadata.librarySectionType] || payload.Metadata.librarySectionType} added`,
		);

		if (
			payload.Metadata.librarySectionType === 'movie' ||
			payload.Metadata.librarySectionType === 'show'
		) {
			const query =
				payload.Metadata.grandparentTitle ||
				payload.Metadata.parentTitle ||
				payload.Metadata.title;

			const type =
				payload.Metadata.librarySectionType === 'movie' ? 'movie' : 'series';

			try {
				const image = await this.fetchCoverUrl(query, type);
				embed.setThumbnail(image);
			} catch (e) {
				this.logger.error(e);
			}
		}

		if (payload.Metadata.librarySectionType !== 'movie') {
			if (payload.Metadata.grandparentTitle) {
				embed.addFields({
					name:
						grandparentMap[payload.Metadata.librarySectionType] ||
						'Grandparent',
					value: payload.Metadata.grandparentTitle,
				});
			}
			if (payload.Metadata.parentTitle) {
				embed.addFields({
					name: parentMap[payload.Metadata.librarySectionType] || 'Parent',
					value: payload.Metadata.parentTitle,
				});
			}
		}

		embed.addFields({
			name: 'Title',
			value: payload.Metadata.title,
		});

		await (channel as TextChannel).send({ embeds: [embed] });

		return 'Ok';
	}

	private async fetchCoverUrl(title: string, mediaType: 'movie' | 'series') {
		return firstValueFrom(
			this.httpService
				.get<{ status: string; data: { token: string } }>(`${TVDB_API}/login`, {
					data: { apiKey: this.configService.get('TVDB_API_TOKEN') },
				})
				.pipe(
					mergeMap((result) => {
						return this.httpService.get<TVDBSearchResponse>(
							`${TVDB_API}/search`,
							{
								params: {
									query: title,
									type: mediaType,
								},
								headers: {
									Authorization: `Bearer ${result.data.data.token}`,
									Accept: 'application/json',
								},
							},
						);
					}),
					map((result) => {
						if (result.data.data.length > 0) {
							const imageUrls = result.data.data
								.map((item) => item.image_url)
								.filter((item) => !!item);
							if (imageUrls.length > 0) {
								return imageUrls[0];
							}
						}
						return '';
					}),
				),
		);
	}

	private secretIsValid(maybeSecret: string) {
		const secret = this.configService.get('PLEX_WEBHOOK_SECRET');
		return secret === maybeSecret;
	}
}

type TVDBSearchResponse = {
	status: string;
	data: {
		aliases: string[];
		companies: string[];
		companyType: string;
		country: string;
		director: string;
		first_air_time: string;
		genres: string[];
		id: string;
		image_url: string;
		is_official: boolean;
		name_translated: string;
		network: string;
		objectID: string;
		officialList: string;
		overview: string;
		overviews: Record<string, string>;
		overview_translated: string[];
		poster: string;
		posters: string[];
		primary_language: string;
		remote_ids: {
			id: string;
			type: number;
			sourceName: string;
		}[];
		status: string;
		slug: string;
		studios: string[];
		title: string;
		thumbnail: string;
		translations: Record<string, string>;
		translationsWithLang: string[];
		tvdb_id: string;
		type: string;
		year: string;
	}[];
	links: {
		prev: string;
		next: string;
		self: string;
		total_items: number;
		page_size: number;
	};
};
