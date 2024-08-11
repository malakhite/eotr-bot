import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { PlexController } from './plex.controller';
import { PlexService } from './plex.service';

import { FilesModule } from '../files/files.module';

@Module({
	providers: [PlexService],
	controllers: [PlexController],
	imports: [FilesModule, HttpModule],
})
export class PlexModule {}
