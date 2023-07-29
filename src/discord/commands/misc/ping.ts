import { ChatInputCommandInteraction, Client } from 'discord.js';
import { ICommand } from '../ICommand.js';
import { replyOk } from '../../embeds/responses.js';

/**
 * Local custom ping command
 */
export const ping: ICommand = {
    name: 'ping',
    description: 'Pong?',
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply();

        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        await interaction.editReply(replyOk(`Pong! Client ${ping}ms | Websocket ${bot.ws.ping}ms`));
    }
}
