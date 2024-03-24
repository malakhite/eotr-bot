import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { validate } from './env.validation';

import { DiscordModule } from '../discord/discord.module';
import { TwitchModule } from '../twitch/twitch.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate,
		}),
		EventEmitterModule.forRoot(),
		DiscordModule,
		TwitchModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
