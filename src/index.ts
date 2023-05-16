import 'dotenv/config';

import { NetworkController, PlayerInfoRio } from '@model/network/index.js';
import { Client, IntentsBitField } from 'discord.js';
import { ActivityType } from 'discord-api-types/v9';
import { eventHandler } from './discord/handlers/eventHandler.js';
import { logger } from './logger/Logger.js';

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
});

eventHandler(bot);

bot.login(process.env.DISCORD_BOT_TOKEN);
