import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder } from 'discord.js';

import { PlexUpdateDto } from './plex-update.dto';

import { FilesService } from '../files/files.service';

@Injectable()
export class PlexService {
	private readonly logger = new Logger(PlexService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly discordClient: Client,
		private readonly fileService: FilesService,
	) {}

	async handleLibraryNew(
		plexUpdateDto: PlexUpdateDto,
		thumb?: Express.Multer.File,
	) {
		this.logger.debug(plexUpdateDto);

		const channel = this.discordClient.channels.cache.get(
			this.configService.get('DISCORD_PLEX_CHANNEL'),
		);

		if (!channel.isTextBased()) {
			this.logger.error('DISCORD_PLEX_CHANNEL is not a text channel.');
			throw new InternalServerErrorException();
		}

		const embed = new EmbedBuilder().setTitle(
			`New ${plexUpdateDto.Metadata.librarySectionType} added`,
		);

		if (thumb) {
			const url = await this.fileService.retrieveFileUrl(
				this.configService.get('HOST'),
				thumb.buffer,
			);

			embed.setThumbnail(url.toString());
		}

		if (plexUpdateDto.Metadata.librarySectionType !== 'movie') {
			if (plexUpdateDto.Metadata.grandparentTitle) {
				embed.addFields({
					name: 'Grandparent',
					value: plexUpdateDto.Metadata.grandparentTitle,
				});
			}
			if (plexUpdateDto.Metadata.parentTitle) {
				embed.addFields({
					name: 'Parent',
					value: plexUpdateDto.Metadata.parentTitle,
				});
			}
		}

		embed.addFields({
			name: 'Title',
			value: plexUpdateDto.Metadata.title,
		});

		return 'Ok';
	}
}
