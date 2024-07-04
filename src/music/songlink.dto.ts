import { IsIn, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";

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
    @IsString()
    entityUniqueId: string;

    @IsUrl()
    url: string;

    @IsOptional()
    @IsUrl()
    nativeAppUriMobile?: string;

    @IsOptional()
    @IsUrl()
    nativeAppUriDesktop?: string;
}

class EntityByUniqueId {
    @IsString()
    id: string;

    @IsIn(['song', 'album'])
    type: 'song' | 'album';

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    artistName?: string;

    @IsOptional()
    @IsUrl()
    thummbnailUrl?: string;

    @IsOptional()
    @IsNumber()
    thumbnailWidth?: number;

    @IsOptional()
    @IsNumber()
    thumbnailHeight?: number;

    @IsString()
    apiProvider: APIProvider;

    @IsString({ each: true })
    platforms: Platform[];
}

export class SongLinkResponse {
    @IsString()
    entityUniqueId: string

    @IsString()
    userCountry: string;

    @IsUrl()
    pageUrl: string;

    @ValidateNested()
    linksByPlatform: Record<Platform, LinkByPlatform>;

    @ValidateNested()
    entitiesByUniqueId: Record<string, EntityByUniqueId>
}