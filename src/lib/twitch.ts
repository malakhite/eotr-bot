import { EmbedBuilder } from 'discord.js';

import type { EventSubStreamOnlineEvent } from '@twurple/eventsub-base';
import type { FastifyInstance } from 'fastify';

export function createLiveHandler(fastify: FastifyInstance) {
	return async function postChannelLive(event: EventSubStreamOnlineEvent) {
		const { discord } = fastify;
		const updatesChannel = discord.channels.cache.get(
			fastify.config.DISCORD_UPDATES_CHANNEL,
		);
		if (!updatesChannel) {
			fastify.log.error({
				message: 'Unable to open DISCORD_UPDATES_CHANNEL',
				channel: fastify.config.DISCORD_UPDATES_CHANNEL,
			});
			return;
		}
		if (!updatesChannel.isTextBased()) {
			fastify.log.error({
				message: 'DISORD_UPDATES_CHANNEL is not a text channel.',
				channel: fastify.config.DISCORD_UPDATES_CHANNEL,
			});
			return;
		}

		const broadcaster = await event.getBroadcaster();
		const stream = await event.getStream();

		const channelUrl = new URL(broadcaster.displayName, 'https://twitch.tv');
		const thumbnail = broadcaster.profilePictureUrl;

		const goingLiveEmbed = new EmbedBuilder()
			.setTitle(`${event.broadcasterDisplayName} is streaming now!`)
			.setURL(channelUrl.toString())
			.setThumbnail(thumbnail);

		if (stream?.gameName) {
			goingLiveEmbed.addFields({ name: 'Playing', value: stream.gameName });
		}

		await updatesChannel.send({ embeds: [goingLiveEmbed] });
	};
}
