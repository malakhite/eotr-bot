import { Body, Controller, Post } from '@nestjs/common';

import { PlexUpdateDto } from './plex-update.dto';
import { PlexService } from './plex.service';

@Controller('plex')
export class PlexController {
	constructor(private readonly plexService: PlexService) {}

	@Post('webhook')
	async updates(
		@Body()
		plexUpdateDto: PlexUpdateDto,
	) {
		if (plexUpdateDto.event === 'library.new') {
			const result = await this.plexService.handleLibraryNew(plexUpdateDto);

			return result;
		}

		return 'Ok';
	}
}
