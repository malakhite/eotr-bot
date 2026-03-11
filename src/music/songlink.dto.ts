export type Platform =
	| 'amazonMusic'
	| 'amazonStore'
	| 'anghami'
	| 'appleMusic'
	| 'audiomack'
	| 'audius'
	| 'bandcamp'
	| 'boomplay'
	| 'deezer'
	| 'google'
	| 'googleStore'
	| 'itunes'
	| 'napster'
	| 'pandora'
	| 'soundcloud'
	| 'spinrilla'
	| 'spotify'
	| 'tidal'
	| 'yandex'
	| 'youtube'
	| 'youtubeMusic';

export type APIProvider =
	| 'amazon'
	| 'anghami'
	| 'audiomack'
	| 'audius'
	| 'bandcamp'
	| 'boomplay'
	| 'deezer'
	| 'google'
	| 'itunes'
	| 'napster'
	| 'pandora'
	| 'soundcloud'
	| 'spinrilla'
	| 'spotify'
	| 'tidal'
	| 'yandex'
	| 'youtube';

class LinkByPlatform {
	entityUniqueId: string;
	url: string;
	nativeAppUriMobile?: string;
	nativeAppUriDesktop?: string;
}

class EntityByUniqueId {
	id: string;
	type: 'song' | 'album';
	title?: string;
	artistName?: string;
	thumbnailUrl?: string;
	thumbnailWidth?: number;
	thumbnailHeight?: number;
	apiProvider: APIProvider;
	platforms: Platform[];
}

export class SongLinkResponse {
	entityUniqueId: string;
	userCountry: string;
	pageUrl: string;
	linksByPlatform: Record<Platform, LinkByPlatform>;
	entitiesByUniqueId: Record<string, EntityByUniqueId>;
}
