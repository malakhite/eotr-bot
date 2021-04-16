import { Message, MessageEmbed } from 'discord.js';
import { FastifyInstance } from 'fastify';
import commands from './index';

const { PREFIX = '!' } = process.env;

export default {
  name: 'help',
  description: 'Send a help message as a DM',
  usage: [
    { detail: '', description: 'Print a list of available commands' },
    {
      detail: '<command>',
      description: 'Print usage information for a specific command',
    },
  ],
  args: false,
  async execute(message: Message, args: string[], fastify: FastifyInstance) {
    const { author } = message;

    if (args.length && commands.has(args[0])) {
      const [requestedCommand] = args;
      try {
        const command = commands.get(requestedCommand)!;
        const dm = await author.createDM();
        const fields = command.usage.map((subCommand) => {
          if (subCommand.description === '') {
            return {
              name: `\`${PREFIX}${command.name}\``,
              value: subCommand.description,
            };
          }
          return {
            name: `\`${PREFIX}${command.name} ${subCommand.detail}\``,
            value: subCommand.description,
          };
        });
        const reply = new MessageEmbed()
          .setTitle(`\`${command.name}\``)
          .setDescription(command.description)
          .addFields(fields);
        return dm.send(reply);
      } catch (e) {
        fastify.log.error(e);
      }
    }

    try {
      const dm = await author.createDM();
      const mappedCommands = commands.map((V) => {
        const name = `\`${V.name}\``;
        const value = V.description;
        return { name, value };
      });
      const reply = new MessageEmbed()
        .setTitle('Help')
        .setDescription(
          `For the usage of a specific command, try \`${PREFIX}help <command>\``
        )
        .addFields(mappedCommands);
      return dm.send(reply);
    } catch (e) {
      fastify.log.error(e);
    }
  },
};
