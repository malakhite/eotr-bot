import Discord from 'discord.js';
import { readdirSync } from 'fs';

import type Command from '../interfaces/commands';

const commands = new Discord.Collection<string, Command>();

const commandFiles = readdirSync('./dist/commands');
for (const file of commandFiles) {
  const command: Command = require(`../commands/${file}`).default;
  commands.set(command.name, command);
}

export default commands;
