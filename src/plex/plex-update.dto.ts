class AccountDto {
	id: number;
	thumb?: string;
	title: string;
}

class ServerDto {
	title: string;
	uuid: string;
}

class PlayerDto {
	local: boolean;
	publicAddress: string;
	title: string;
	uuid: string;
}

class Guid {
	id: string;
}

class MetadataDto {
	librarySectionType: string;
	ratingKey: string;
	key: string;
	grandparentRatingKey: string;
	guid: string;
	librarySectionId: number;
	type: string;
	title: string;
	grandparentKey: string;
	parentKey: string;
	grandparentTitle: string;
	parentTitle: string;
	summary: string;
	index: number;
	parentIndex: number;
	thumb: string;
	art: string;
	parentThumb: string;
	grandparentThumb: string;
	grandparentArt: string;
	addedAt: number;
	updatedAt: number;
	Guid: Guid[];
}

export class PlexUpdateDto {
	event?: string;
	user?: boolean;
	owner?: boolean;
	Account?: AccountDto;
	Server?: ServerDto;
	Player?: PlayerDto;
	Metadata?: MetadataDto;
}

export class PlexPayloadDto {
	payload?: string;
}
