import { z } from 'zod';

export function validate(config: Record<string, unknown>) {
	return z
		.object({
			PORT: z.number().default(8080),
			HOST: z.string().default('0.0.0.0'),
			DISCORD_TOKEN: z.string(),
			DISCORD_APP_ID: z.string(),
			DISCORD_GUILD_ID: z.string(),
			DISCORD_OPTIONAL_CATEGORY_ID: z.string(),
			DISCORD_PLEX_CHANNEL: z.string(),
			DISCORD_UPDATES_CHANNEL: z.string(),
			DISCORD_WORD_GAMES_CHANNEL: z.string(),
			DISCORD_WORD_GAMES_SCHEDULE: z.string(),
			LOCAL_TIMEZONE: z.string(),
			TWITCH_CLIENT_ID: z.string(),
			TWITCH_CLIENT_SECRET: z.string(),
			TWITCH_EVENTSUB_SECRET: z.string(),
			TWITCH_EVENTSUB_PATH: z.string(),
			ENABLE_TWITCH: z.coerce.boolean().default(false),
		})
		.parse(config);
}
