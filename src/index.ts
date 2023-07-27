import { Client, IntentsBitField } from 'discord.js';
import { eventHandler } from './discord/handlers/eventHandler.js';
import { logger } from './logger/Logger.js';
import mongoose from 'mongoose';

/*
const nc: NetworkController = new NetworkController();
const info: Promise<PlayerInfoRio> = nc.getPlayerInfo('Myrxia2');
info.then(_ => console.log('ok')).catch(r => console.log('not ok:',r));
*/

const bot: Client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true,
    }
});

(async () => {
    try {
        logger.info(`starting program with NODE_ENV=${process.env.NODE_ENV}`);
        const mongoUri: string | undefined = process.env.MONGODB_URI;
        if (!mongoUri) {
            logger.error('did not find environment variable \'MONGODB_URI\'');
            return;
        }
        await mongoose.connect(mongoUri);
        logger.info('connected to mongo db');

        eventHandler(bot);

        bot.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
        logger.error(`error: ${error}`);
    }
})();
