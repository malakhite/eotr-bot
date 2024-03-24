import { StringOption } from 'necord';

export class MusicDto {
	@StringOption({
		name: 'url',
		description: 'The url of a known streaming source',
		required: true,
	})
	url: string;
}
