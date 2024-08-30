export type SongService = {
	service: string;
	url: string;
};

export type SongServiceResponse = {
	artist: string;
	title: string;
	cover?: string;
	services: SongService[];
};

export interface IMusicSearchProvider {
	getSongByUrl: (url: string) => Promise<SongServiceResponse>;
}
