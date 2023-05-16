import { Client } from 'discord.js';
import { logger } from '../../../logger/Logger.js';

/**
 * Discord bot 'ready' event that logs bot connexion
 *
 * @param bot - discord.js client
 * @note the export default is important as we are using ES6 dynamic default imports
 * @note registered via `eventHandler.ts`
 */
export default function log(bot: Client): void {
    logger.info(`✅ ${bot?.user?.tag} is online!`);
}
