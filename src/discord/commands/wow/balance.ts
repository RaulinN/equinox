import { ICommand } from '../ICommand.js';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { replyWarn } from '../../embeds/responses.js';

/**
 * Local custom balance command
 */
export const balance: ICommand = {
    name: 'balance',
    description: `Affiche les golds que tu vas recevoir`,
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply(replyWarn(':tools: Work in progress! :tools:'));
    }
}
