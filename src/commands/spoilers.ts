import Discord, { Message, MessageEmbed } from 'discord.js';
import roles from '../config/roles.json';
import { log } from '../modules/logger';

interface RoleSpec {
  name: string;
  id: string;
  channel: string;
  description: string;
}
const rooms = new Discord.Collection<string, RoleSpec>();
for (const role of roles) {
  rooms.set(role.name, role);
}

async function handleInvalidRoom(message: Message, room: string) {
  return message.reply(`${room} isn't an available room`);
}

export default {
  name: 'spoilers',
  description: 'Join and leave spoiler channels',
  usage: [
    { detail: 'join <room>', description: 'Joins the specified room' },
    { detail: 'leave <room>', description: 'Leaves the specified room' },
    { detail: 'list', description: 'Lists available rooms' },
  ],
  args: true,
  async execute(message: Message, args: string[]) {
    const { author, guild } = message;
    const guildMember = guild?.member(author);
    const [action, room] = args;
    try {
      switch (action) {
        case 'join':
          if (rooms.has(room)) {
            if (guildMember?.roles.cache.has(room)) {
              return message.reply(`you're already in ${room}`);
            } else {
              return guildMember?.roles.add(rooms.get(room)!.id);
            }
          } else {
            return handleInvalidRoom(message, room);
          }
        case 'leave':
          if (rooms.has(room)) {
            if (guildMember?.roles.cache.some((role) => role.name === room)) {
              return guildMember.roles.remove(rooms.get(room)!.id);
            } else {
              return message.reply(
                `I can't remove you from ${room} since you're not in there.`
              );
            }
          } else {
            return handleInvalidRoom(message, room);
          }
        case 'list':
          const mappedRooms = rooms.map((item) => {
            return {
              name: item.name,
              value: item.description,
            };
          });
          const embed = new MessageEmbed()
            .setTitle('These are the rooms I can add you to:')
            .addFields(mappedRooms);
          return message.reply(embed);
        default:
          return message.reply(`I don't understand ${action}.`);
      }
    } catch (e) {
      log.error({ type: 'error', error_details: e });
    }
  },
};
