import 'dotenv/config';
import Discord, { Message } from 'discord.js';

import commands from './modules/commands';
import { log } from './modules/logger';

const { DISCORD_TOKEN, PREFIX = '!' } = process.env;

const client = new Discord.Client();

client.on('ready', () => {
  log.info({ type: 'info', message: `logged in as ${client.user?.tag}` });
});

client.on('message', async (msg) => {
  const { content } = msg;
  if (!content.startsWith(PREFIX) || msg.author.bot) return;

  log.info({ type: 'message', content });
  const args = content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (commandName && !commands.has(commandName)) {
    log.error({
      type: 'error',
      error_message: `${commandName} wasn't found in ${commands.map(
        (command) => command.name
      )}`,
    });
    return msg.reply("that doesn't seem like a valid command");
  }
  const command = !!commandName && commands.get(commandName);
  if (command && command.args && !args.length) {
    return msg.reply(`you didn't provide any arguments`);
  }

  try {
    if (!command) {
      return;
    } else {
      await command.execute(msg, args);
    }
  } catch (e) {
    log.error(e);
    msg.reply('there was an error trying to execute that command!');
  }
});

client.on('disconnect', () =>
  log.warn({ type: 'warning', message: 'disconnected from Discord' })
);

client.login(DISCORD_TOKEN);

const handle = (signal: string) => {
  client.destroy();
  log.info({ type: 'info', message: `exiting with signal: ${signal}` });
  process.exit();
};

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
