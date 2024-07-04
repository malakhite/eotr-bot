import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { validate } from './env.validation';

import { DiscordModule } from '../discord/discord.module';
import { FilesModule } from '../files/files.module';
import { MusicModule } from '../music/music.module';
import { PlexModule } from '../plex/plex.module';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		LoggerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (config: ConfigService) => {
				return {
					pinoHttp: { level: config.get('LOG_LEVEL') },
				};
			},
		}),
		FilesModule,
		DiscordModule,
		EventEmitterModule.forRoot(),
		MusicModule,
		PlexModule,
		ScheduleModule.forRoot(),
		TwitchModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
