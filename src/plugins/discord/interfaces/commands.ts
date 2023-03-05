import type {
	ChatInputCommandInteraction,
	InteractionResponse,
	Message,
	SlashCommandBuilder,
} from 'discord.js';
import { FastifyInstance } from 'fastify';

export default interface Command {
	data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
	execute: (
		server: FastifyInstance,
		interaction: ChatInputCommandInteraction,
	) => Promise<InteractionResponse>;
}
