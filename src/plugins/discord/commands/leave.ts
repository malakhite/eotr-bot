import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { channels } from '../../../config/channels';

import type Command from '../interfaces/commands';

const leave: Command = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Leave optional channels.')
		.addStringOption((option) => {
			return option
				.setName('channel')
				.setDescription('The channel to be left')
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

		if (!user.roles.cache.has(roleId)) {
			return interaction.reply({
				content: `You aren't in ${channelData.name}.`,
			});
		}

		const removedUser = await user.roles.remove(roleId);

		if (removedUser.roles.cache.has(roleId)) {
			throw new Error(
				`Unable to remove ${removedUser.displayName} from channel ${channelData.name}.`,
			);
		}

		server.log.info(
			`Removed ${user.displayName} from channel ${channelData.name}.`,
		);
		return interaction.reply({
			content: `You have left ${channelData.name}.`,
			ephemeral: true,
		});
	},
};

export default leave;
