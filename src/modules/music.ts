import { URL } from 'url';
import * as rm from 'typed-rest-client/RestClient';

import { MessageEmbed } from 'discord.js';
import { SONGWHIP_URL } from '../constants';
import { log } from './logger';

interface Artist {
  type: 'artist'
  id: number
  path: string
  name: string
  sourceUrl: string
  sourceCountry: string
  url: string
  image: string
  createdAt: string
  updatedAt: string
  refreshedAt: string
  serviceIds: object
  config: any | null
  teamId: any | null
  overrides: any | null
}

interface MusicSource {
  link: string
  countries: string[]
}

interface MusicSources {
  status: string
  data: {
    type: string
    id: number
    path: string
    name: string
    url: string
    sourceUrl: string
    sourceCountry: string
    releaseDate: string
    createdAt: string
    updatedAt: string
    refreshedAt: string
    image: string
    config: any | null
    links: {
      tidal?: MusicSource[]
      amazon?: MusicSource[]
      deezer?: MusicSource[]
      itunes?: MusicSource[]
      napster?: MusicSource[]
      pandora?: MusicSource[]
      spotify?: MusicSource[]
      youtube?: MusicSource[]
      googleplay?: MusicSource[]
      soundcloud?: MusicSource[]
      amazonMusic?: MusicSource[]
      itunesStore?: MusicSource[]
      youtubeMusic?: MusicSource[]
      googleplayStore?: MusicSource[]
    }
    linksOverride: any | null
    linksCountries: string[]
    artists: Artist[]
    overrides: any | null
  }
}

export async function handleMusic(urls: URL[]) {
  const musicSources = [
    'https://listen.tidal.com/track/',
    'https://tidal.com/browse/track/',
    'https://music.apple.com/',
    'https://www.pandora.com/artist/',
    'https://open.spotify.com/track/',
    'https://www.youtube.com/watch',
    'https://youtube.com/watch',
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

  const songwhipClient = new rm.RestClient('music-fetcher', SONGWHIP_URL);
  const payload = {
    url: firstMusicUrl.toString(),
    country: 'US',
  };

  log.info({ type: 'request', path: `${SONGWHIP_URL}/api`, payload });
  const response = await songwhipClient.create<MusicSources>('api', payload);

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
        value: serviceInfo![0].link,
      }));
    return new MessageEmbed()
      .setTitle('More sources')
      .addFields(mappedLinks)
      .setTimestamp();
  }

  throw Error(`Something went wrong. The response was: ${response}`);
}
