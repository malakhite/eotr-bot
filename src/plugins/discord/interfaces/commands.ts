import { Message } from 'discord.js';
import { FastifyInstance } from 'fastify';

export default interface Command {
  name: string;
  description: string;
  usage: {
    detail: string;
    description: string;
  }[];
  args: boolean;
  aliases?: string[];
  execute: (msg: Message, args: string[], fastify?: FastifyInstance) => void;
}
