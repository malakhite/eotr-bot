import Discord from 'discord.js';
import { readdirSync } from 'fs';
import { resolve } from 'path';

import type Command from '../interfaces/commands';

const commands = new Discord.Collection<string, Command>();

const commandFiles = readdirSync(resolve(__dirname, './'));
for (const file of commandFiles) {
  if (file !== 'index.js' && file !== 'index.ts') {
    const command: Command = require(`./${file}`).default;
    commands.set(command.name, command);
  }
}

export default commands;
