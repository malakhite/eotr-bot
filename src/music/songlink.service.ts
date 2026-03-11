import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { providerMap } from './constants';
import { IMusicSearchProvider, MusicResultMap } from './music.interface';
import { SongLinkResponse } from './songlink.dto';

@Injectable()
export class SonglinkService implements IMusicSearchProvider {
	private readonly logger = new Logger(SonglinkService.name);
	private readonly songlinkUrl = 'https://api.song.link';
	private readonly apiVersion = 'v1-alpha.1';

	constructor(private readonly httpService: HttpService) {}

	async getSongByUrl(url: string) {
		const requestUrl = new URL(`/${this.apiVersion}/links`, this.songlinkUrl);

		const { data } = await firstValueFrom(
			this.httpService
				.get<SongLinkResponse>(requestUrl.toString(), {
					params: {
						url,
						songIfSingle: true,
						type: 'song',
					},
				})
				.pipe(
					catchError((error: AxiosError) => {
						this.logger.error(error.response.data);
						throw error.message;
					}),
				),
		);

		const services: MusicResultMap = Object.values(
			data.entitiesByUniqueId,
		).reduce((acc, curr) => {
			if (curr.type === 'song') {
				curr.platforms.forEach((platform) => {
					acc[platform] = {
						artist: curr.artistName,
						service_name: providerMap.get(platform),
						thumbnail: curr.thumbnailUrl,
						title: curr.title,
						url: data.linksByPlatform[platform].url,
					};
				});
			}

			return acc;
		}, {} as MusicResultMap);

		const preferredEntity =
			Object.values(services).find((service) => service.url === 'url') ??
			services.itunes ??
			services.soundcloud ??
			services.bandcamp ??
			services.youtube ??
			Object.values(services)[0];
		const cover = preferredEntity.thumbnail;
		const artist = preferredEntity.artist;
		const title = preferredEntity.title;

		return { artist, title, cover, services };
	}
}
