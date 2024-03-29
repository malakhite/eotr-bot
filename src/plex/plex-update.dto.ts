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

export class PlexUpdateDto {
	@IsOptional()
	@IsString()
	event?: string;

	@IsOptional()
	@IsBoolean()
	user?: boolean;

	@IsOptional()
	@IsBoolean()
	owner?: boolean;

	@IsOptional()
	@ValidateNested()
	Account?: AccountDto;

	@IsOptional()
	@ValidateNested()
	Server?: ServerDto;

	@IsOptional()
	@ValidateNested()
	Player?: PlayerDto;

	@IsOptional()
	@ValidateNested()
	Metadata?: MetadataDto;
}
