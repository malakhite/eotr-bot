type MusicProvider =
	| 'amazon'
	| 'amazonMusic'
	| 'deezer'
	| 'facebook'
	| 'instagram'
	| 'itunes'
	| 'itunesStore'
	| 'lineMusic'
	| 'musicBrainz'
	| 'napster'
	| 'pandora'
	| 'qobuz'
	| 'spotify'
	| 'tidal'
	| 'twitter'
	| 'youtube'
	| 'youtubeMusic';

type MusicLinks = Partial<Record<MusicProvider, MusicSource[]>>;

interface MusicSource {
	link: string;
	countries: string[];
}

interface MusicItem {
	id: number;
	path: string;
	name: string;
	url: string;
	sourceUrl: string;
	sourceCountry: string;
	releaseDate: string;
	createdAt: string;
	updatedAt: string;
	refreshedAt: string;
	image: string;
	isrc: string;
	links: MusicLinks;
	linksCountries: string[];
}

interface Artist extends MusicItem {
	type: 'artist';
	description: string;
	serviceIds: Partial<Record<MusicProvider, string>>;
	orchardId: string;
	spotifyId: string;
}

interface Track extends MusicItem {
	type: 'track';
	artists: Artist[];
}

interface SongwhipSuccess {
	status: 'success';
	data: {
		item: Track;
	};
}

interface SongwhipError {
	status: 'error';
	error: {
		status: number;
		message: string;
		data: {
			url: string;
		};
	};
}

type SongwhipResponse = SongwhipSuccess | SongwhipError;

export {
	Artist,
	Track,
	MusicLinks,
	MusicProvider,
	MusicSource,
	SongwhipError,
	SongwhipResponse,
	SongwhipSuccess,
};
