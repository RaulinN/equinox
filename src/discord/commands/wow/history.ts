import { ICommand } from '../ICommand.js';
import { ChatInputCommandInteraction, Client, EmbedBuilder, EmbedData } from 'discord.js';
import { replyError, replyOk } from '../../embeds/responses.js';
import { Transaction } from '../../../schemas/Transaction.js';
import { Boost } from '../../../schemas/Boost.js';
import { I_GOLD } from '../../utils/index.js';

/**
 * Local custom history command
 */
export const history: ICommand = {
    name: 'history',
    description: 'Affiche l\'historique de tes boosts',
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        await interaction.deferReply({ephemeral: true});

        let nf = new Intl.NumberFormat('en-US');
        let transactions: any = undefined;
        let boosts: any = [];

        try {
            transactions = await Transaction.find({
                guildId: interaction.guildId,
                userId: interaction.user.id,
            });

            if (transactions && transactions.length) {
                let promises: any[] = [];
                transactions.forEach((t: any) => promises.push(Boost.findOne({
                    guildId: interaction.guildId,
                    boostId: t.boostId,
                })));

                boosts = await Promise.all(promises); // may contain undefined values
            }
        } catch (e) {
            await interaction.editReply(replyError(`could not retrieve from db: ${e}`));
            return;
        }

        if (!transactions.length) {
            await interaction.editReply(replyOk(`Tu n'as malheureusement jamais fait de boost run avec nous \\:(`));
            return;
        }

        const dates = boosts.map((b: any, idx: number) => b ? `\`${String(1 + idx).padStart(2, '0')}\` <t:${Math.floor(b.date.getTime() / 1000)}:D>` : '_date not found_').join('\n');
        const boostIds = boosts.map((b: any) => b ? `\`${b.boostId}\`` : '_boostId not found_').join('\n');
        const amounts = transactions.map((t: any) => `${t.paid ? ':white_check_mark:' : ':no_entry_sign:'} ${I_GOLD} \`${nf.format(t.amount)}\``).join('\n');

        const total = transactions.map((t: any) => t.amount).reduce((acc: number, v: number) => {
            return acc + v;
        }, 0);

        const data: EmbedData = {
            title: `:blue_book: | Mes anciennes runs | :blue_book:`,
            fields: [
                {name: 'Total', value: `${I_GOLD} \`${nf.format(total)}\``, inline: true},
                {name: '\u200b', value: '\u200b', inline: true}, // blank cell
                {name: '\u200b', value: '\u200b', inline: true}, // blank cell
                {name: 'Date', value: dates, inline: true},
                {name: 'boostId', value: boostIds, inline: true},
                {name: 'Amount', value: amounts, inline: true},
            ],
        }

        const embed = new EmbedBuilder(data);
        await interaction.editReply({embeds: [embed]});
    }
}
