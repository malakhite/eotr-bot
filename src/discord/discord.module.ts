import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GatewayIntentBits } from 'discord.js';
import { NecordModule } from 'necord';

import { DiscordService } from './discord.service';

import { MusicModule } from '../music/music.module';

@Module({
	imports: [
		HttpModule,
		NecordModule.forRootAsync({
			inject: [ConfigService],
			useFactory(configService: ConfigService) {
				return {
					token: configService.get('DISCORD_TOKEN'),
					intents: [
						GatewayIntentBits.Guilds,
						GatewayIntentBits.GuildMessages,
						GatewayIntentBits.MessageContent,
					],
				};
			},
		}),
		MusicModule,
	],
	providers: [DiscordService],
})
export class DiscordModule {}
