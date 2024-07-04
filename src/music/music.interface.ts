export type SongService = {
    service: string;
    url: string;
}

export type SongServiceResponse = {
    cover: string;
    services: SongService[]
}

export interface IMusicSearchProvider {
    getSongByUrl: (url: string) => Promise<SongServiceResponse>;
}