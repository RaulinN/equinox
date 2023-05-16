import { Client } from 'discord.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { getAllFiles } from '../utils/index.js';

/**
 * Retrieve defined events ('../events') and add their callback
 * functions to the bot
 *
 * @param bot - discord.js client
 */
export function eventHandler(bot: Client) {
    const dirName: string = path.dirname(fileURLToPath(import.meta.url));
    const eventFolders = getAllFiles(path.join(dirName, '..', 'events'), true);

    for (const eventFolder of eventFolders) {
        // sort files alphabetically
        const eventFiles = getAllFiles(eventFolder).sort((x, y) => x > y ? 1 : -1);
        const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

        bot.on(eventName!, async (args) => {
            for (const eventFile of eventFiles) {
                const myModule = await import(eventFile);
                const eventFunction = myModule.default;
                await eventFunction(bot, args);
            }
        });
    }
}
