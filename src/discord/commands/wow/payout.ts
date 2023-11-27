import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    Client,
    Embed,
    EmbedBuilder,
    EmbedData,
    Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from 'discord.js';
import { ICommand } from '../ICommand.js';
import { replyError } from '../../embeds/responses.js';
import { I_GOLD } from '../../utils/index.js';
import { Bank } from '../../../schemas/Bank.js';

function buildPayout(boostId: string, boosterIds: string[], banks: any[], amounts: string[]): EmbedData {
    let nf = new Intl.NumberFormat('en-US');

    const vUserIds: string[] = boosterIds.map((bid: string, idx: number) => `:no_entry_sign: \`${String(1+idx).padStart(2, '0')}\` <@${bid}>`);
    const vBanks: string[] = banks.map((b: any) => b
        ? `\`${b.name}-${b.realm}\``
        : '_Not specified_'
    );
    const vAmounts: string[] = amounts.map((a: string) => `${I_GOLD} \`${nf.format(+a)}\``);

    return {
        title: ':envelope: | Payouts | :envelope:',
        description: `:id: Boost id \`${boostId}\``,
        color: 0xd4a219,
        fields: [
            {name: 'userId', value: vUserIds.join('\n'), inline: true},
            {name: 'Bank-character', value: vBanks.join('\n'), inline: true},
            {name: 'Amount', value: vAmounts.join('\n'), inline: true},
        ],
    };
}


/**
 * Local custom payout command
 */
export const payout: ICommand = {
    name: 'payout',
    description: 'Display next payout',
    devOnly: true,
    options: [
        {
            name: 'boost-id',
            description: 'The id of the boost in question',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    callback: async (bot: Client, interaction: any) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        await interaction.deferReply();


        const boostId = interaction.options.get('boost-id')!.value;
        if (typeof boostId !== 'string') {
            await interaction.editReply(replyError('argument \`boostId\` is not a string'));
            return;
        }


        const guildId = interaction.guildId;
        const boostMessage: Message = await interaction.channel.messages.fetch(boostId);
        const boostEmbed: Embed = boostMessage.embeds[0];

        const boosterIds = boostEmbed.fields[12].value
            .split('\n')
            .map((e: string) => e.split(' ')[1].slice(2, -1));
        const amounts = boostEmbed.fields[13].value
            .split('\n')
            .map((e: string) => e.split(' ')[1].replace(/,/g, ''));


        let promises: any[] = [];
        boosterIds.forEach(boosterId => promises.push(Bank.findOne({
            userId: boosterId,
            guildId: guildId,
        })));

        const banks = await Promise.all(promises);
        const embedDataPayout: EmbedData = buildPayout(boostId, boosterIds, banks, amounts);
        const embedPayouts = new EmbedBuilder(embedDataPayout);
        let reply = await interaction.editReply({
            embeds: [embedPayouts],
            components: [],
        });

        const payoutId: string = reply.id;

        const options: any = boosterIds.map((bid: string, idx: number) => new StringSelectMenuOptionBuilder()
            .setLabel(`${String(idx + 1).padStart(2, '0')} – ${bid}`)
            .setValue(`${idx + 1}`)
            .setEmoji('✉')
        );

        const selectMenu: any = new StringSelectMenuBuilder()
            .setCustomId(`payout.single-recipient.${boostId}.${payoutId}`)
            .setPlaceholder('Make a selection...')
            .setMinValues(0)
            .setMaxValues(boosterIds.length)
            .addOptions(options)

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.editReply({
            embeds: [embedPayouts],
            components: [row],
        });
    }
}
