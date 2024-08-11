import dayjs from './lib/date-time';

export const SONGWHIP_URL = 'https://songwhip.com/';

export const WORDGAMES = [
	{
		game: 'Wordle',
		startDate: dayjs('2021-06-20').startOf('day'),
	},
	{
		game: 'Connections',
		startDate: dayjs('2023-06-12').startOf('day'),
	},
];

export const APP_START_EVENT = 'app-started';
export const TWITCH_USER_IDS = ['72535319'];

export const SELF_ASSIGNABLE_ROLES = [
	'1198632852141637703',
	'1210915657093484654',
	'1251694219026890752',
	'1258200737381486603',
];

export const TVDB_API = 'https://api4.thetvdb.com/v4';
