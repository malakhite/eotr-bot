import { Body, Controller, Post, Query } from '@nestjs/common';

import { PlexUpdateDto } from './plex-update.dto';
import { PlexService } from './plex.service';

@Controller('plex')
export class PlexController {
	constructor(private readonly plexService: PlexService) {}

	@Post('webhook')
	async updates(
		@Query('secret')
		secret: string,

		@Body()
		plexUpdateDto: PlexUpdateDto,
	) {
		if (plexUpdateDto.event === 'library.new') {
			const result = await this.plexService.handleLibraryNew(
				plexUpdateDto,
				secret,
			);

			return result;
		}

		return 'Ok';
	}
}
