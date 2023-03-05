export const MusicSources: Record<
	string,
	{ name: string; apiKeys: string[]; urls: string[] }
> = {
	applemusic: {
		name: 'Apple Music',
		apiKeys: ['itunes'],
		urls: ['https://music.apple.com/'],
	},
	spotify: {
		name: 'Spotify',
		apiKeys: ['spotify'],
		urls: ['https://open.spotify.com/track/'],
	},
	tidal: {
		name: 'Tidal',
		apiKeys: ['tidal'],
		urls: [
			'https://listen.tidal.com/track/',
			'https://tidal.com/browse/track/',
			'https://tidal.com/track/',
		],
	},
	youtube: {
		name: 'YouTube',
		apiKeys: ['youtube', 'youtubeMusic'],
		urls: [
			'https://www.youtube.com/watch',
			'https://youtube.com/watch',
			'https://youtu.be/',
			'https://music.youtube.com/watch',
		],
	},
};

export const reportableServices = Object.values(MusicSources).reduce(
	(acc, entry) => {
		return [...acc, ...entry.apiKeys];
	},
	[] as string[],
);

export const musicUrls = Object.values(MusicSources).reduce((acc, entry) => {
	return [...acc, ...entry.urls];
}, [] as string[]);

export const SONGWHIP_URL = 'https://songwhip.com/';
