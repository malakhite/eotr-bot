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
		if (!count) {
			throw new Error('No count entered');
		}
		if (!sides) {
			throw new Error('Number of sides not entered');
		}
		const dice: number[] = [];
		for (let i = 0; i < count; i++) {
			dice.push(Math.floor(Math.random() * sides));
		}
		const total = dice.reduce((acc, curr) => {
			return (acc += curr);
		}, 0);

		const embed = new EmbedBuilder()
			.setTitle('Roll result')
			.addFields(
				{ name: 'Die rolls', value: dice.join(', ') },
				{ name: 'Total', value: total.toString() },
			);

		return interaction.editReply({
			embeds: [embed],
		});
	},
};

export default roll;
