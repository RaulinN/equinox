import { Client } from 'discord.js';
import { logger } from '../../../logger/Logger.js';
import { replyError, replyWarn } from '../../embeds/responses.js';
import { sendPayoutMessage } from '../../commands/wow/payout.js';
import { UID_WEXUS } from '../../utils/index.js';

export default async function handleButtons(bot: Client, interaction: any): Promise<void> {
    if (!interaction.isContextMenuCommand()) return;

    logger.debug(`registered context menu command interaction with name=${interaction.commandName}`);

    try {
        if (interaction.commandName === 'Generate payout') {
            // checking permissions
            if (interaction.user.id !== UID_WEXUS) {
                await interaction.reply({
                    ...replyWarn('Don\'t worry I\'ll handle that \\=) Ces options sont là pour ' +
                        'moi afin de pouvoir facilement m\'indiquer qui il me reste à payer'), ephemeral: true
                });
                return;
            }

            await sendPayoutMessage(interaction, interaction.targetId);
        }
    } catch (e) {
        await interaction.reply(replyError(`error while handling context menu command interaction name=${interaction.commandName}: ${e}`));
    }
}
