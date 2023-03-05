import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { channels } from '../../../config/channels';

import type Command from '../interfaces/commands';

const join: Command = {
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Join optional channels.')
		.addStringOption((option) => {
			return option
				.setName('channel')
				.setDescription('The channel to be joined')
				.setRequired(true)
				.addChoices(
					...channels.map((channel) => ({
						name: channel.name,
						value: channel.roleId,
					})),
				);
		}),
	execute: async function execute(server, interaction) {
		const roleId = interaction.options.getString('channel');

		if (!roleId) {
			throw new Error('Invalid channel recieved.');
		}

		const channelData = channels.find((channel) => channel.roleId === roleId);

		if (!channelData) {
			throw new Error('No matching role found in config.');
		}

		const user =
			interaction.member instanceof GuildMember && interaction.member;
		if (!user) {
			return interaction.reply('Invalid user.');
		}

		if (user.roles.cache.has(roleId)) {
			server.log.info(
				`User ${user.displayName} already in channel ${channelData.name}.`,
			);
			return interaction.reply({
				content: `You are already in ${channelData.name}.`,
			});
		}

		const addedUser = await user.roles.add(roleId);

		if (!addedUser.roles.cache.has(roleId)) {
			throw new Error(
				`Unable to add ${addedUser.displayName} to channel ${channelData.name}.`,
			);
		}

		server.log.info(
			`Added ${user.displayName} to channel ${channelData.name}.`,
		);
		return interaction.reply({
			content: `You have joined ${channelData.name}.`,
			ephemeral: true,
		});
	},
};

export default join;
