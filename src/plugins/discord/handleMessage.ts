import { Message } from 'discord.js';
import { FastifyInstance } from 'fastify';
import commands from './commands';

const { PREFIX = '!' } = process.env;

async function handleMessage(msg: Message, fastify: FastifyInstance) {
  const { content } = msg;
  if (!content.startsWith(PREFIX) || msg.author.bot) return;

  fastify.log.info(content);
  const args = content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  const command =
    !!commandName &&
    (commands.get(commandName) ||
      commands.find((cmd) => !!cmd.aliases?.includes(commandName)));

  if (!command) {
    fastify.log.error(
      `${commandName} wasn't found in ${commands.map(
        (command) => command.name
      )}`
    );
    return msg.reply("that doesn't seem like a valid command");
  }

  if (command && command.args && !args.length) {
    return msg.reply("you didn't provide any arguments");
  }

  try {
    if (!command) {
      return;
    } else {
      await command.execute(msg, args, fastify);
    }
  } catch (e) {
    fastify.log.error(e);
    msg.reply('there was an error trying to execute that command!');
  }
}

export default handleMessage;
