import type { Platform } from './songlink.dto';

export type SongService = {
	service: string;
	url: string;
};

export type SongServiceResponse = {
	artist: string;
	title: string;
	cover?: string;
	services: MusicResultMap;
};

export interface IMusicSearchProvider {
	getSongByUrl: (url: string) => Promise<SongServiceResponse>;
}

export type MusicResult = {
	artist: string;
	service_name: string;
	thumbnail?: string;
	title: string;
	url: string;
};

export type MusicResultMap = Partial<Record<Platform, MusicResult>>;
