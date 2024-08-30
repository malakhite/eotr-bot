import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import { providerMap } from './constants';
import { IMusicSearchProvider } from './music.interface';
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

		const entities = Object.values(data.entitiesByUniqueId);
		const preferredEntity =
			entities.find((entity) => entity.apiProvider === 'itunes') || entities[0];
		const cover = preferredEntity.thumbnailUrl;
		const artist = preferredEntity.artistName;
		const title = preferredEntity.title;

		const services = Object.entries(data.linksByPlatform)
			.filter(([key]) => providerMap.has(key))
			.map(([key, value]) => ({
				service: providerMap.get(key),
				url: value.url,
			}))
			.sort((a, b) => (a.service < b.service ? -1 : 1));

		return { artist, title, cover, services };
	}
}
