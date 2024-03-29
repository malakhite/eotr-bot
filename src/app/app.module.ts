import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { validate } from './env.validation';

import { DiscordModule } from '../discord/discord.module';
import { PlexModule } from '../plex/plex.module';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		LoggerModule.forRoot(),
		DiscordModule,
		EventEmitterModule.forRoot(),
		PlexModule,
		ScheduleModule.forRoot(),
		TwitchModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
