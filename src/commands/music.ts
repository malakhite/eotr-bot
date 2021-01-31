import { URL } from 'url';
import * as rm from 'typed-rest-client/RestClient';
import { Message, MessageEmbed } from 'discord.js';
import { SONGWHIP_URL } from '../constants';
import { log } from '../modules/logger';
import { MusicSources } from '../interfaces/music';
import { extractUrl } from '../utils';

async function handleMusic(urls: URL[]) {
  const musicSources = [
    'https://listen.tidal.com/track/',
    'https://tidal.com/browse/track/',
    'https://tidal.com/track/',
    'https://music.apple.com/',
    'https://www.pandora.com/artist/',
    'https://open.spotify.com/track/',
    'https://www.youtube.com/watch',
    'https://youtube.com/watch',
    'https://youtu.be/',
  ];

  const reportableServices = {
    itunes: 'Apple Music',
    spotify: 'Spotify',
    tidal: 'Tidal',
    youtube: 'YouTube',
  } as const;
  type ReportableServices = typeof reportableServices;
  type ReportableService = keyof ReportableServices;

  const [firstMusicUrl] = urls.filter((url) =>
    musicSources.some((source) => url.toString().includes(source))
  );

  if (!firstMusicUrl) {
    const error = new Error('No music URLs identified');
    log.error({ type: 'error', error_message: error });
    throw error;
  }
  const songwhipClient = new rm.RestClient('music-fetcher', SONGWHIP_URL);
  const payload = {
    url: firstMusicUrl.toString(),
    country: 'US',
  };

  log.info({ type: 'request', path: `${SONGWHIP_URL}api`, payload });
  const response = await songwhipClient.create<MusicSources>('api', payload);

  if (response.statusCode !== 200) {
    log.error({ type: 'error', ...response });
  }
  if (response.result?.data) {
    log.info({ type: 'response', ...response });
    const {
      result: {
        data: { links },
      },
    } = response;
    const mappedLinks = Object.entries(links)
      .filter(
        ([key, value]) =>
          value![0] && Object.keys(reportableServices).includes(key)
      )
      .map(([serviceName, serviceInfo]) => ({
        name: reportableServices[serviceName as ReportableService],
        value: serviceInfo![0].link.replace('{country}', 'us'),
      }));
    return new MessageEmbed()
      .setTitle('More sources')
      .addFields(mappedLinks)
      .setTimestamp();
  }

  throw Error(`Something went wrong. The response was: ${response}`);
}

export default {
  name: 'music',
  description: 'Get alternative music sources',
  usage: [
    {
      detail: '<music service URL>',
      description: 'Gets music sources based on the URL provided',
    },
  ],
  args: true,
  async execute(message: Message, args: string[]) {
    const { channel, content } = message;
    try {
      const urls = extractUrl(content);
      const result = await handleMusic(urls);
      channel.send(result);
    } catch (e) {
      if (
        e.message === 'No URLs identified' ||
        e.message === 'No music URLs identified'
      ) {
        log.debug({ type: 'error', message: `${e.message} in ${content}` });
        message.reply(e.message);
      } else {
        log.error({ type: 'error', error_details: e });
      }
    }
  },
};
