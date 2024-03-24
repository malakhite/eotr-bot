import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'discord.js';

import { PlexUpdateDto } from './plex-update.dto';

@Injectable()
export class PlexService {
	private readonly logger = new Logger(PlexService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly discordClient: Client,
	) {}

	async sendPlexUpdateMessage(plexUpdateDto: PlexUpdateDto) {
		this.logger.debug(plexUpdateDto);

		const channel = this.discordClient.channels.cache.get(
			this.configService.get('DISCORD_PLEX_CHANNEL'),
		);

		if (!channel.isTextBased()) {
			this.logger.error('DISCORD_PLEX_CHANNEL is not a text channel.');
			throw new InternalServerErrorException();
		}

		if (plexUpdateDto.Metadata.librarySectionType === 'movie') {
			await channel.send(`${plexUpdateDto.Metadata.title} has been added.`);
		} else {
			const dataPoints = [
				plexUpdateDto.Metadata.grandparentTitle,
				plexUpdateDto.Metadata.parentTitle,
				plexUpdateDto.Metadata.title,
			];

			await channel.send(`${dataPoints.join(' - ')} has been added.`);
		}

		return 'Ok';
	}
}
