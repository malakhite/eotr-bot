type Platform =
	| 'spotify'
	| 'itunes'
	| 'appleMusic'
	| 'youtube'
	| 'youtubeMusic'
	| 'google'
	| 'googleStore'
	| 'pandora'
	| 'deezer'
	| 'tidal'
	| 'amazonStore'
	| 'amazonMusic'
	| 'soundcloud'
	| 'napster'
	| 'yandex'
	| 'spinrilla'
	| 'audius'
	| 'audiomack'
	| 'anghami'
	| 'boomplay';

type APIProvider =
	| 'spotify'
	| 'itunes'
	| 'youtube'
	| 'google'
	| 'pandora'
	| 'deezer'
	| 'tidal'
	| 'amazon'
	| 'soundcloud'
	| 'napster'
	| 'yandex'
	| 'spinrilla'
	| 'audius'
	| 'audiomack'
	| 'anghami'
	| 'boomplay';

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
