import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEventSubHttpListener } from '@nestjs-twurple/eventsub-http';
import { EventSubSubscription } from '@twurple/eventsub-base';
import { EventSubMiddleware } from '@twurple/eventsub-http';
import { Client, EmbedBuilder } from 'discord.js';

import { TWITCH_USER_IDS } from '../constants';

@Injectable()
export class TwitchService implements OnModuleInit {
	private readonly logger = new Logger(TwitchService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly discordClient: Client,

		@InjectEventSubHttpListener()
		private readonly eventSubListener: EventSubMiddleware,
	) {}

	async onModuleInit() {
		await this.eventSubListener.markAsReady();

		const subscriptions = new Map<string, EventSubSubscription>();

		for await (const userId of TWITCH_USER_IDS) {
			const eventSubscription = this.eventSubListener.onStreamOnline(
				userId,
				async (event) => {
					this.logger.debug({ msg: 'Received Twitch event', event });

					const updatesChannel = this.discordClient.channels.cache.get(
						this.configService.get('DISCORD_UPDATES_CHANNEL'),
					);
					if (!updatesChannel) {
						this.logger.error({
							msg: 'Unable to open DISCORD_UPDATES_CHANNEL',
							channel: this.configService.get('DISCORD_UPDATES_CHANNEL'),
						});
						return;
					}
					if (!updatesChannel.isTextBased()) {
						this.logger.error({
							msg: 'DISORD_UPDATES_CHANNEL is not a text channel.',
							channel: this.configService.get('DISCORD_UPDATES_CHANNEL'),
						});
						return;
					}

					const broadcaster = await event.getBroadcaster();
					const stream = await event.getStream();

					const channelUrl = new URL(broadcaster.name, 'https://twitch.tv');
					const thumbnail = broadcaster.profilePictureUrl;

					const goingLiveEmbed = new EmbedBuilder()
						.setTitle(`${event.broadcasterDisplayName} is streaming now!`)
						.setURL(channelUrl.toString())
						.setThumbnail(thumbnail);

					if (stream?.gameName) {
						goingLiveEmbed.addFields({
							name: 'Playing',
							value: stream.gameName,
						});
					}

					await updatesChannel.send({ embeds: [goingLiveEmbed] });
				},
			);
			const testUrl = await eventSubscription.getCliTestCommand();
			this.logger.log({
				msg: `Added event subscription for ${userId}.`,
				testUrl,
			});
			subscriptions.set(eventSubscription.id, eventSubscription);
		}
	}
}
