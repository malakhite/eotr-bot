import {
	Body,
	Controller,
	Logger,
	Post,
	Query,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PlexPayloadDto } from './plex-update.dto';
import { PlexService } from './plex.service';

@Controller('plex')
export class PlexController {
	private readonly logger = new Logger(PlexController.name);

	constructor(private readonly plexService: PlexService) {}

	@Post('webhook')
	@UseInterceptors(FileInterceptor('thumb'))
	async updates(
		@UploadedFile()
		_thumb: Express.Multer.File,

		@Query('secret')
		secret: string,

		@Body()
		plexPayloadDto: PlexPayloadDto,
	) {
		this.logger.debug({ msg: 'recieved payload', payload: plexPayloadDto });

		const payload = JSON.parse(plexPayloadDto.payload);

		if (payload.event === 'library.new') {
			const result = await this.plexService.handleLibraryNew(payload, secret);

			return result;
		}

		return 'Ok';
	}
}
