import { URL } from 'url';
import * as rm from 'typed-rest-client/RestClient';
import { Message, MessageEmbed } from 'discord.js';
import { SONGWHIP_URL } from '../../../constants';
import { MusicSources } from '../interfaces/music';
import { extractUrl } from '../../../utils';
import { FastifyInstance } from 'fastify';

async function handleMusic(urls: URL[], fastify: FastifyInstance) {
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
    'https://music.youtube.com/watch',
  ];

  const reportableServices = {
    itunes: 'Apple Music',
    spotify: 'Spotify',
    tidal: 'Tidal',
    youtube: 'YouTube',
    youtubeMusic: 'YouTube Music',
  } as const;
  type ReportableServices = typeof reportableServices;
  type ReportableService = keyof ReportableServices;

  const [firstMusicUrl] = urls.filter((url) =>
    musicSources.some((source) => url.toString().includes(source))
  );

  if (!firstMusicUrl) {
    throw new Error('No music URLs identified');
  }
  const songwhipClient = new rm.RestClient('music-fetcher', SONGWHIP_URL);
  const payload = {
    url: firstMusicUrl.toString(),
    country: 'US',
  };

  fastify.log.info({
    type: 'outgoing-request',
    path: `${SONGWHIP_URL}api`,
    payload,
  });
  const response = await songwhipClient.create<MusicSources>('api', payload);

  if (response.statusCode !== 200) {
    fastify.log.error(response);
  }
  if (response.result?.data) {
    fastify.log.info({ type: 'incoming-response', ...response });
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
  async execute(message: Message, args: string[], fastify: FastifyInstance) {
    const { channel, content } = message;
    try {
      const urls = extractUrl(content);
      const result = await handleMusic(urls, fastify);
      await channel.send(result);
    } catch (e) {
      if (
        e.message === 'No URLs identified' ||
        e.message === 'No music URLs identified'
      ) {
        fastify.log.debug(`${e.message} in ${content}`);
        message.reply(e.message);
      } else {
        fastify.log.error(e);
      }
    }
  },
};
