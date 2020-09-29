import { URL } from 'url';
import * as rm from 'typed-rest-client/RestClient';
import { MessageEmbed } from 'discord.js';
import { SONGWHIP_URL } from '../constants';
import { log } from './logger';
import { MusicSources } from '../interfaces/music';

export async function handleMusic(urls: URL[]) {
  const musicSources = [
    'https://listen.tidal.com/track/',
    'https://tidal.com/browse/track/',
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

  const [firstMusicUrl] = urls.filter((url) => musicSources.some(
    (source) => url.toString().includes(source),
  ));

  if (!firstMusicUrl) {
    throw Error('No music URLs identified');
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
        data: {
          links,
        },
      },
    } = response;
    const mappedLinks = Object.entries(links)
      .filter(([key, value]) => (value![0] && Object.keys(reportableServices).includes(key)))
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
