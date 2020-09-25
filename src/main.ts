import 'dotenv/config';
import Discord from 'discord.js';
import Pino from 'pino';

import { extractUrl } from './utils';
import { handleMusic } from './modules/music';

const {
  DISCORD_TOKEN,
  DISCORD_MUSIC_CHANNEL,
} = process.env;

const client = new Discord.Client();
const log = Pino();

client.on('ready', () => {
  log.info(`Logged in as ${client.user?.tag}`);
});

client.on('message', async (msg) => {
  const {
    channel,
    content,
  } = msg;
  if (channel.id === DISCORD_MUSIC_CHANNEL) {
    try {
      const urls = extractUrl(content);
      const result = await handleMusic(urls);
      channel.send(result);
    } catch (e) {
      if (e.message === 'No URLs identified') {
        log.debug(`${e.message} in ${content}`);
      } else {
        log.error(e);
      }
    }
  }
});

client.login(DISCORD_TOKEN);
