import { Module } from '@nestjs/common';

import { PlexController } from './plex.controller';
import { PlexService } from './plex.service';

@Module({
	providers: [PlexService],
	controllers: [PlexController],
})
export class PlexModule {}
