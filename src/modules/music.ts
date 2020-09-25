import { URL } from 'url';
import * as rm from 'typed-rest-client/RestClient';

import { MessageEmbed } from 'discord.js';
import { SONGWHIP_URL } from '../constants';

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
      tidal: MusicSource[]
      amazon: MusicSource[]
      deezer: MusicSource[]
      itunes: MusicSource[]
      napster: MusicSource[]
      pandora: MusicSource[]
      spotify: MusicSource[]
      youtube: MusicSource[]
      googleplay: MusicSource[]
      soundcloud: MusicSource[]
      amazonMusic: MusicSource[]
      itunesStore: MusicSource[]
      youtubeMusic: MusicSource[]
      googleplayStore: MusicSource[]
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
  ];

  const [firstMusicUrl] = urls.filter((url) => musicSources.some(
    (source) => url.toString().includes(source),
  ));

  const songwhipClient = new rm.RestClient('music-fetcher', SONGWHIP_URL);
  const payload = {
    url: firstMusicUrl.toString(),
    country: 'US',
  };

  const response = await songwhipClient.create<MusicSources>('api', payload);

  const links = response.result?.data.links;
  const message = new MessageEmbed()
    .setTitle('More sources')
    .addFields(
      { name: 'YouTube', value: links?.youtube[0].link },
      { name: 'Spotify', value: links?.spotify[0].link },
      { name: 'Apple Music', value: links?.itunes[0].link.replace('{country}', 'US') },
      { name: 'Tidal', value: links?.tidal[0].link },
    )
    .setTimestamp();

  return message;
}
