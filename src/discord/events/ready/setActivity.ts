import { Client } from 'discord.js';

// https://stackoverflow.com/questions/74309898/how-to-add-an-activitytype-or-an-activity-to-your-bot-in-javascript-discordjs-ve
/**
 * Discord bot 'ready' event that changes the bot's activity
 *
 * @param bot - discord.js client
 * @note the export default is important as we are using ES6 dynamic default imports
 * @note registered via `eventHandler.ts`
 */
export default function setActivity(bot: Client): void {
    bot.user!.setActivity('ce bg de Myrxia', {type: 2});
}
