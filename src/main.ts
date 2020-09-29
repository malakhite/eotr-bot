import 'dotenv/config';
import Discord from 'discord.js';

import { log } from './modules/logger';
import { extractUrl } from './utils';
import { handleMusic } from './modules/music';

const {
  DISCORD_TOKEN,
  DISCORD_MUSIC_CHANNEL,
} = process.env;

const client = new Discord.Client();

client.on('ready', () => {
  log.info(`Logged in as ${client.user?.tag}`);
});

client.on('message', async (msg) => {
  const {
    channel,
    content,
  } = msg;
  if (channel.id === DISCORD_MUSIC_CHANNEL || content.startsWith('!music')) {
    try {
      const urls = extractUrl(content);
      const result = await handleMusic(urls);
      channel.send(result);
    } catch (e) {
      if (e.message === 'No URLs identified' || e.message === 'No music URLs identified') {
        log.debug({ type: 'error', message: `${e.message} in ${content}` });
      } else {
        log.error({ type: 'error', error_details: e });
      }
    }
  }
});

client.login(DISCORD_TOKEN);
