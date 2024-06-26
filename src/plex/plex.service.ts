import {
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder } from 'discord.js';

import { PlexUpdateDto } from './plex-update.dto';

import { FilesService } from '../files/files.service';

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
		private readonly fileService: FilesService,
	) {}

	async handleLibraryNew(
		payload: PlexUpdateDto,
		secret: string,
		thumb?: Express.Multer.File,
	) {
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

		if (thumb) {
			const url = await this.fileService.retrieveFileUrl(
				this.configService.get('HOST'),
				thumb.buffer,
			);

			embed.setThumbnail(url.toString());
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

		await channel.send({ embeds: [embed] });

		return 'Ok';
	}

	private secretIsValid(maybeSecret: string) {
		const secret = this.configService.get('PLEX_WEBHOOK_SECRET');
		return secret === maybeSecret;
	}
}
