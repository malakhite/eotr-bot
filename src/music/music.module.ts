import { Module } from '@nestjs/common';

import { SonglinkService } from './songlink.service';

@Module({
    providers: [
        SonglinkService
    ]
})
export class MusicModule {}
