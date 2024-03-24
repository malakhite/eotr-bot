import { NumberOption } from 'necord';

export class RollDto {
	@NumberOption({
		name: 'count',
		description: 'The number of dice to roll.',
		required: true,
	})
	count: number;

	@NumberOption({
		name: 'sides',
		description: 'The number of sides each die should have.',
		required: true,
	})
	sides: number;
}
