import dayjs from './lib/date-time';

export const SONGWHIP_URL = 'https://songwhip.com/';

export const WORDGAMES = [
	{
		game: 'Wordle',
		startDate: dayjs('2021-06-19').startOf('day'),
	},
	{
		game: 'Connections',
		startDate: dayjs('2023-06-11').startOf('day'),
	},
];
