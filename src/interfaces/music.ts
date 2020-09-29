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

export { Artist, MusicSource, MusicSources };
