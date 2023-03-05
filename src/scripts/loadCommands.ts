import { REST, Routes } from 'discord.js';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APP_ID;
const guildId = process.env.DISCORD_GUILD_ID;

(async function readCommands() {
	const commands = [];
	const commandsPath = join(__dirname, '..', 'plugins', 'discord', 'commands');
	const commandFiles = readdirSync(commandsPath);

	for (const file of commandFiles) {
		const command = await import(join(__dirname, file));
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '10' }).setToken(token!);

	try {
		console.log(`Refreshing ${commands.length} application (/) commands.`);

		const data = (await rest.put(
			Routes.applicationGuildCommands(appId!, guildId!),
			{ body: commands },
		)) as unknown[];

		console.log(data);

		console.log(
			`Successfully reloaded ${data.length} application (/) conmmands.`,
		);
	} catch (e) {
		console.error(e);
	}
})();
