import { Controller, Get, Param } from '@nestjs/common';

import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Get(':name')
	async retrieveImage(@Param('name') name: string) {
		return this.filesService.readFile(name);
	}
}
