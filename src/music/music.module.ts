import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { SonglinkService } from './songlink.service';

@Module({
	imports: [HttpModule],
	providers: [SonglinkService],
	exports: [SonglinkService],
})
export class MusicModule {}
