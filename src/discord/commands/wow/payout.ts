import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    ComponentType,
    Embed,
    EmbedBuilder,
    EmbedData,
    InteractionCollector,
    Message
} from 'discord.js';
import { ICommand } from '../ICommand.js';
import { replyError } from '../../embeds/responses.js';
import { I_GOLD, UID_WEXUS } from '../../utils/index.js';
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
            content: '# Etat des transferts',
            embeds: [embedPayouts],
            components: [],
        });

        const payoutId: string = reply.id;

        let rows: any[] = [];
        let n: number = 1;
        let row: any = new ActionRowBuilder();
        for (const _ of boosterIds) {
            row.addComponents(new ButtonBuilder()
                .setLabel(`${String(n).padStart(2, '0')}`)
                .setEmoji('✉️')
                .setStyle(ButtonStyle.Danger)
                .setCustomId(`payout.${boostId}.${payoutId}.4.${n}`));

            if (n % 5 === 0) {
                rows.push(row);
                row = new ActionRowBuilder();
            }

            n += 1;
        }

        if (n % 5 !== 1) {
            rows.push(row);
        }

        reply = await interaction.editReply({
            content: '# Etat des transferts',
            embeds: [embedPayouts],
            components: rows,
        });


        // collect button clicks & listen for them
        const filter = (i: ButtonInteraction) => i.user.id === UID_WEXUS;
        const collector: InteractionCollector<any> = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
        });


        collector.on('collect', async (interactionButton: any) => {
            const [cmd, bid, pid, styl, n] = interactionButton.customId.split('.');
            if (!cmd || !bid || !pid || !n || cmd !== 'payout') {
                await interactionButton.reply(`unknown custom id '${interactionButton.customId}' while pressing a payout button`);
                return;
            }


            // switch embed emoji
            const payoutMessage: Message = await interactionButton.channel.messages.fetch(pid);
            const payoutEmbed: Embed = payoutMessage.embeds[0];

            const idx: number = (+n) - 1;
            const newV = payoutEmbed.fields[0].value.split('\n')
            if (newV[idx].startsWith(':no_entry_sign:')) {
                newV[idx] = newV[idx].replace(':no_entry_sign:', ':white_check_mark:');
            } else {
                newV[idx] = newV[idx].replace(':white_check_mark:', ':no_entry_sign:');
            }
            payoutEmbed.fields[0].value = newV.join('\n');


            await interaction.editReply({
                content: '# Etat des transferts',
                embeds: [payoutEmbed],
                components: payoutMessage.components,
            });

            interactionButton.deferUpdate();
            return;
        });
    }
}
