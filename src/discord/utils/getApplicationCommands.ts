import { Client, Guild } from 'discord.js';

/**
 * Fetch guild application commands
 *
 * @param bot - discord.js client
 * @param guildId - discord guild id
 */
export default async function getApplicationCommands(bot: Client, guildId?: string): Promise<any> {
    let applicationCommands;

    if (typeof guildId !== 'undefined') {
        // fetch guild commands
        const guild: Guild = await bot.guilds.fetch(guildId);
        applicationCommands = guild.commands;
        await applicationCommands.fetch();
    } else {
        // fetch global commands
        applicationCommands = await bot.application?.commands;
        await applicationCommands?.fetch();
    }

    return applicationCommands;
}
