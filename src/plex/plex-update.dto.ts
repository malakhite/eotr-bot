import {
	IsBoolean,
	IsIP,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	IsUrl,
	ValidateNested,
} from 'class-validator';

export class PlexUpdateDto {
	@IsString()
	event: string;

	@IsBoolean()
	user: boolean;

	@IsBoolean()
	owner: boolean;

	@ValidateNested()
	Account: AccountDto;

	@ValidateNested()
	Server: ServerDto;

	@ValidateNested()
	Player: PlayerDto;

	@ValidateNested()
	Metadata: MetadataDto;
}

class AccountDto {
	@IsNumber()
	id: number;

	@IsUrl()
	@IsOptional()
	thumb?: string;

	@IsString()
	title: string;
}

class ServerDto {
	@IsString()
	title: string;

	@IsUUID()
	uuid: string;
}

class PlayerDto {
	@IsBoolean()
	local: boolean;

	@IsIP()
	publicAddress: string;

	@IsString()
	title: string;

	@IsUUID()
	uuid: string;
}

class MetadataDto {
	@IsString()
	librarySectionType: string;

	@IsString()
	ratingKey: string;

	@IsString()
	key: string;

	@IsString()
	grandparentRatingKey: string;

	@IsString()
	guid: string;

	@IsNumber()
	librarySectionId: number;

	@IsString()
	type: string;

	@IsString()
	title: string;

	@IsString()
	grandparentKey: string;

	@IsString()
	parentKey: string;

	@IsString()
	grandparentTitle: string;

	@IsString()
	parentTitle: string;

	@IsString()
	summary: string;

	@IsNumber()
	index: number;

	@IsNumber()
	parentIndex: number;

	@IsUrl()
	thumb: string;

	@IsUrl()
	art: string;

	@IsUrl()
	parentThumb: string;

	@IsUrl()
	grandparentThumb: string;

	@IsUrl()
	grandparentArt: string;

	@IsNumber()
	addedAt: number;

	@IsNumber()
	updatedAt: number;
}
