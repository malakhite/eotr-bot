import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PlexUpdateDto } from './plex-update.dto';
import { PlexService } from './plex.service';

@Controller('plex')
export class PlexController {
	constructor(private readonly plexService: PlexService) {}

	@Post('webhook')
	@UseInterceptors(FileInterceptor('thumb'))
	async updates(
		@Body()
		plexUpdateDto: PlexUpdateDto,

		@UploadedFile()
		thumb?: Express.Multer.File,
	) {
		if (plexUpdateDto.event === 'library.new') {
			const result = await this.plexService.handleLibraryNew(
				plexUpdateDto,
				thumb,
			);

			return result;
		}

		return 'Ok';
	}
}
