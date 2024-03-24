import { Module } from '@nestjs/common';
import { PlexService } from './plex.service';
import { PlexController } from './plex.controller';

@Module({
  providers: [PlexService],
  controllers: [PlexController]
})
export class PlexModule {}
