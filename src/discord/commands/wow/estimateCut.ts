import { ICommand } from '../ICommand.js';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, EmbedBuilder, EmbedData } from 'discord.js';
import { replyError } from '../../embeds/responses.js';
import { P_CUT_BOOSTERS, P_CUT_COLLECTOR, P_CUT_RL } from './pcr.js';
import { I_GOLD } from '../../utils/index.js';

/**
 * Local custom cut estimation command
 */
export const estimateCut: ICommand = {
    name: 'estimate-cut',
    description: `Estimation de ta cut raider`,
    options: [
        {
            name: 'total-pot',
            description: 'The entire client pot',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'number-boosters',
            description: 'The number of boosters',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'percentage-cut-boosters',
            description: 'The booster cut percentage',
            type: ApplicationCommandOptionType.Number,
            required: false,
        },
        {
            name: 'percentage-cut-rl',
            description: 'The booster cut raid leader',
            type: ApplicationCommandOptionType.Number,
            required: false,
        },
        {
            name: 'percentage-cut-gc',
            description: 'The booster cut gold collector',
            type: ApplicationCommandOptionType.Number,
            required: false,
        }
    ],
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        await interaction.deferReply({ephemeral: true});

        // total pot
        let pot = interaction.options.get('total-pot')!.value;
        if (typeof pot !== 'number') {
            await interaction.editReply(replyError('argument \`total-pot\` is not a number'));
            return;
        }
        // number of boosters
        const numberClients = interaction.options.get('number-boosters')!.value;
        if (typeof numberClients !== 'number') {
            await interaction.editReply(replyError('argument \`number-boosters\` is not a number'));
            return;
        }

        let pCutBoosters = interaction.options.get('percentage-cut-boosters')?.value;
        pCutBoosters = (typeof pCutBoosters === 'undefined') ? P_CUT_BOOSTERS : pCutBoosters;
        if (typeof pCutBoosters !== 'number') {
            await interaction.editReply(replyError('argument \`percentage-cut-boosters\` is not a number'));
            return;
        }
        if (pCutBoosters < 0 || pCutBoosters > 1) {
            await interaction.editReply(replyError('argument \`percentage-cut-boosters\` should be a percentage (decimal value between 0 and 1)'));
            return;
        }
        let pCutRl = interaction.options.get('percentage-cut-rl')?.value;
        pCutRl = (typeof pCutRl === 'undefined') ? P_CUT_RL : pCutRl;
        if (typeof pCutRl !== 'number') {
            await interaction.editReply(replyError('argument \`percentage-cut-rl\` is not a number'));
            return;
        }
        if (pCutRl < 0 || pCutRl > 1) {
            await interaction.editReply(replyError('argument \`percentage-cut-rl\` should be a percentage (decimal value between 0 and 1)'));
            return;
        }
        let pCutGc = interaction.options.get('percentage-cut-gc')?.value || P_CUT_COLLECTOR;
        pCutGc = (typeof pCutGc === 'undefined') ? P_CUT_COLLECTOR : pCutGc;
        if (typeof pCutGc !== 'number') {
            await interaction.editReply(replyError('argument \`percentage-cut-gc\` is not a number'));
            return;
        }
        if (pCutGc < 0 || pCutGc > 1) {
            await interaction.editReply(replyError('argument \`percentage-cut-gc\` should be a percentage (decimal value between 0 and 1)'));
            return;
        }

        if (pCutBoosters + pCutRl + pCutGc < 0 || pCutBoosters + pCutRl + pCutGc > 1) {
            await interaction.editReply(replyError('the sum of boosters, rl, and gc cuts should be a percentage (decimal value between 0 and 1)'));
            return;
        }

        const n: number = Math.trunc(numberClients);

        // check n and pot
        if (pot < 0) {
            await interaction.editReply(replyError('argument \`pot\` cannot be negative'));
            return;
        }
        if (n <= 0) {
            await interaction.editReply(replyError('argument \`number-clients\` cannot be negative or null'));
            return;
        }


        const cut: number = pot * (pCutBoosters - pCutRl - pCutGc) / n;

        let nf = new Intl.NumberFormat('en-US');
        const data: EmbedData = {
            title: `:tools: | Cut estimation tool | :tools:`,
            fields: [
                {name: 'Estimation', value: `${I_GOLD} **${nf.format(cut)}**`, inline: true},
                {name: '\u200b', value: '\u200b', inline: true}, // blank cell
                {name: '\u200b', value: '\u200b', inline: true}, // blank cell
                {name: 'Booster cut', value: `\`${pCutBoosters}\``, inline: true},
                {name: 'Raid leader cut', value: `\`${pCutRl}\``, inline: true},
                {name: 'Gold collector cut', value: `\`${pCutGc}\``, inline: true},
            ],
        }

        const embed = new EmbedBuilder(data);
        await interaction.editReply({embeds: [embed]});
    }
}
