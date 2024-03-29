import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import Command from '../interfaces/commands';

const roll: Command = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a wisdom check!')
		.addNumberOption((option) => {
			return option
				.setName('count')
				.setDescription('The number of dice to roll.')
				.setRequired(true);
		})
		.addNumberOption((option) => {
			return option
				.setName('sides')
				.setDescription('The number of sides each die should have.')
				.setRequired(true);
		}),
	execute: async function execute(server, interaction) {
		const count = interaction.options.getNumber('count');
		const sides = interaction.options.getNumber('sides');
		server.log.debug({ count, sides });
		if (!count) {
			throw new Error('No count entered');
		}
		if (!sides) {
			throw new Error('Number of sides not entered');
		}
		const dice: number[] = Array.from(new Array(count)).map(() =>
			Math.floor(Math.random() * sides + 1),
		);
		const total = dice.reduce((acc, curr) => {
			return (acc += curr);
		}, 0);

		server.log.debug({ dice, total });
		const embed = new EmbedBuilder()
			.setTitle('Roll result')
			.setDescription(`Rolled ${count}D${sides}`)
			.addFields(
				{ name: 'Die rolls', value: dice.join(', ') },
				{ name: 'Total', value: total.toString() },
			);

		return interaction.reply({
			embeds: [embed],
		});
	},
};

export default roll;
