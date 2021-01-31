import { Message } from 'discord.js';

export default interface Command {
  name: string;
  description: string;
  usage: {
    detail: string;
    description: string;
  }[];
  args: boolean;
  execute: (msg: Message, args: string[]) => void;
}
