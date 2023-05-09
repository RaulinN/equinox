import 'dotenv/config';

import { NetworkController, PlayerInfoRio } from '@model/network/index.js';
import { Client, IntentsBitField } from 'discord.js';
import { logger } from '@logger/Logger.js';
import { ActivityType } from 'discord-api-types/v9';

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

// https://stackoverflow.com/questions/74309898/how-to-add-an-activitytype-or-an-activity-to-your-bot-in-javascript-discordjs-ve
bot.on('ready', (b) => {
    logger.info(`✅ ${b.user.tag} is online!`);
    b.user.setActivity("ce bg de Myrxia", { type: 2 });
});

bot.on('messageCreate', (msg) => {
    logger.debug(`logging message '${msg.content}' in ${msg.channel} from ${msg.author}`);

    if (msg.author.bot) return;

    if (msg.content === 'hello') {
        msg.reply('hi!');
    }
});

bot.login(process.env.DISCORD_BOT_TOKEN);
