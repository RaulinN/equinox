import { Client, Embed, Message } from 'discord.js';
import { logger } from '../../../logger/Logger.js';
import { replyError, replyWarn } from '../../embeds/responses.js';
import { UID_WEXUS } from '../../utils/index.js';
import { Transaction } from '../../../schemas/Transaction.js';

export default async function handleSelectMenus(bot: Client, interaction: any): Promise<void> {
    if (!interaction.isStringSelectMenu()) return; // maybe change this depending on if I add other select menus types

    logger.debug(`registered select menu interaction with customId=${interaction.customId} and values=${interaction.values}`);
    if (!interaction.customId) return;

    const id: string = interaction.customId;
    const splitId: string[] = id.split('.');


    try {
        if (splitId[0] === 'payout' && splitId[1] === 'single-recipient') {
            if (!interaction.inGuild() || interaction.user.bot) return;

            // checking permissions
            if (interaction.user.id !== UID_WEXUS) {
                await interaction.reply({
                    ...replyWarn('Don\'t worry I\'ll handle that \\=) Ces options sont là pour ' +
                        'moi afin de pouvoir facilement m\'indiquer qui il me reste à payer'), ephemeral: true
                });
                return;
            }

            const [cmd, _, bid, pid] = splitId;
            if (!cmd || !bid || !pid) {
                await interaction.reply(replyError(`unknown custom id '${id}' while using a payout selection`));
                return;
            }

            const values = interaction.values;
            if (!values.length) return; // if no options were selected


            const payoutMessage: Message = await interaction.channel.messages.fetch(pid);
            const payoutEmbed: Embed = payoutMessage.embeds[0];

            for (const value of values) {
                // switch embed emoji
                const idx: number = (+value) - 1;
                const boosterPayment = payoutEmbed.fields[0].value.split('\n')
                if (boosterPayment[idx].startsWith(':no_entry_sign:')) {
                    boosterPayment[idx] = boosterPayment[idx].replace(':no_entry_sign:', ':white_check_mark:');
                } else {
                    boosterPayment[idx] = boosterPayment[idx].replace(':white_check_mark:', ':no_entry_sign:');
                }
                payoutEmbed.fields[0].value = boosterPayment.join('\n');

                // edit db entry
                const userId = (boosterPayment[idx].split(' ').slice(-1)[0]).slice(2, -1);
                const query = {
                    userId: userId,
                    guildId: interaction.guildId,
                    boostId: bid,
                };

                let instance: any = await Transaction.findOne(query);
                if (!instance) {
                    await interaction.reply(replyError(`could not find userId=${query.userId}, guildId=${query.guildId}, boostId=${query.boostId}`));
                    return;
                }

                instance.paid = !instance.paid;

                await instance.save();
            }


            await payoutMessage.edit({
                embeds: [payoutEmbed],
            });

            interaction.deferUpdate();
            return;
        }

    } catch (e) {
        await interaction.reply(replyError(`error while handling select menu interaction customId=${id}: ${e}`));
    }
}
