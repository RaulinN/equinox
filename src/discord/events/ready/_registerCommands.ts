// This file has been given the highest priority and thus should be first alphabetically
import { Client } from 'discord.js';
import { ICommand } from '../../commands/ICommand.js';
import getApplicationCommands from '../../utils/getApplicationCommands.js';
import { logger } from '../../../logger/Logger.js';
import { commandDiff, getLocalCommands } from '../../utils/index.js';

/**
 * Discord bot 'ready' event that registers commands when the bot is starting
 *
 * @param bot - discord.js client
 *
 * @note the export default is important as we are using ES6 dynamic default imports
 * @note registered via `eventHandler.ts`
 */
export default async function registerCommands(bot: Client): Promise<void> {
    try {
        const localCommands: ICommand[] = await getLocalCommands();
        const applicationCommands = await getApplicationCommands(bot);

        for (const localCommand of localCommands) {
            const {name, description, options, type} = localCommand;

            const existingCommand = await applicationCommands.cache.find((cmd: ICommand) => cmd.name === name);

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    logger.info(`🗑️ deleted command '${name}'`);
                    continue;
                }

                if (commandDiff(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                    });

                    logger.info(`🔄 edited command '${name}'`);
                } else {
                    logger.info(`⏭️  skipped registering command '${name}' (already exists and up-to-date)`);
                }
            } else {
                if (localCommand.deleted) {
                    logger.info(`⏭️  skipped registering command '${name}' (set to delete)`);
                    continue;
                }

                // type undefined => slash command
                if (!type) {
                    await applicationCommands.create({
                        name,
                        description,
                        options,
                    });
                    // type defined => context menu command
                } else {
                    await applicationCommands.create({
                        name,
                        type,
                    });
                }

                logger.info(`➕ registered command '${name}'`);
            }
        }
    } catch (e) {
        logger.error(`error registering command: ${e}`);
    }
    return;
}
