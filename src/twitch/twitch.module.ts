import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TWURPLE_API_CLIENT, TwurpleApiModule } from '@nestjs-twurple/api';
import { TWURPLE_AUTH_PROVIDER, TwurpleAuthModule } from '@nestjs-twurple/auth';
import { TwurpleEventSubHttpModule } from '@nestjs-twurple/eventsub-http';
import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';

import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';

@Module({
	imports: [
		TwurpleAuthModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService],
			useFactory(configService: ConfigService) {
				return {
					type: 'refreshing',
					clientId: configService.get('TWITCH_CLIENT_ID'),
					clientSecret: configService.get('TWITCH_CLIENT_SECRET'),
				};
			},
		}),
		TwurpleApiModule.registerAsync({
			isGlobal: true,
			inject: [TWURPLE_AUTH_PROVIDER],
			useFactory(authProvider: RefreshingAuthProvider) {
				return { authProvider };
			},
		}),
		TwurpleEventSubHttpModule.registerAsync({
			isGlobal: true,
			inject: [ConfigService, TWURPLE_API_CLIENT],
			useFactory(configService: ConfigService, apiClient: ApiClient) {
				return {
					apiClient,
					secret: configService.get('TWITCH_EVENTSUB_SECRET'),
					hostName: 'eb.scottabbey.com',
					pathPrefix: configService.get('TWITCH_EVENTSUB_PATH'),
				};
			},
		}),
	],
	controllers: [TwitchController],
	providers: [TwitchService],
})
export class TwitchModule {}
