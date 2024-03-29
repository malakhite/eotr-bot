import { Module } from '@nestjs/common';

import { PlexController } from './plex.controller';
import { PlexService } from './plex.service';

import { FilesService } from '../files/files.service';

@Module({
	providers: [PlexService],
	controllers: [PlexController],
	imports: [FilesService],
})
export class PlexModule {}
