import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { validate } from './env.validation';

import { DiscordModule } from '../discord/discord.module';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		DiscordModule,
		EventEmitterModule.forRoot(),
		ScheduleModule.forRoot(),
		TwitchModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
