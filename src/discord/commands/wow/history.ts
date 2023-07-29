import { ICommand } from '../ICommand.js';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { replyWarn } from '../../embeds/responses.js';
import { logger } from '../../../logger/Logger.js';

/**
 * Local custom history command
 */
export const history: ICommand = {
    name: 'history',
    description: 'Affiche l\'historique de tes boosts',
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply(replyWarn(':tools: Work in progress! :tools:'));
    }
}
