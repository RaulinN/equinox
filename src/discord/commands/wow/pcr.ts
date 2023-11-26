import { ICommand } from '../ICommand.js';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    ComponentType,
    Embed,
    EmbedBuilder,
    EmbedData,
    InteractionCollector, InteractionResponse
} from 'discord.js';
import { I_ADV, I_CROWN, I_GOLD, I_RAID, I_SWORD, I_TANK, UID_WEXUS } from '../../utils/index.js';
import { replyError, replySuccess } from '../../embeds/responses.js';
import { logger } from '../../../logger/Logger.js';
import { Boost } from '../../../schemas/Boost.js';
import { Transaction } from '../../../schemas/Transaction.js';
import { Bank } from '../../../schemas/Bank.js';

export const P_CUT_BOOSTERS: number = 0.6;
export const P_CUT_ADVERTISERS: number = 0.3;
// const P_CUT_RCU: number = 1 - P_CUT_BOOSTERS - P_CUT_ADVERTISERS;

export const P_CUT_COLLECTOR: number = 0.01;
export const P_CUT_RL: number = 0.035;

const ROLE_BOOSTER: string = '<@&1131932731836731452>';


function buildPcr(interaction: ChatInputCommandInteraction): [string, EmbedData | undefined] {
    let nf = new Intl.NumberFormat('en-US');

    // total pot
    let pot = interaction.options.get('total-pot')!.value;
    if (typeof pot !== 'number') {
        return ['argument \`total-pot\` is not a number', undefined];
    }
    // number of clients
    const numberClients = interaction.options.get('number-clients')!.value;
    if (typeof numberClients !== 'number') {
        return ['argument \`number-clients\` is not a number', undefined];
    }


    // user that executed the command
    const user: string = `<@${interaction.user.id}>`;
    // number of boosters
    let numberBoosters = interaction.options.get('number-boosters')?.value;
    // boosters
    const boosters = interaction.options.get('boosters')?.value;
    let boosterIds: string[] = [];


    if (numberBoosters !== undefined && boosters !== undefined) {
        return ['arguments \`number-boosters\` and \`boosters\` are mutually exclusive', undefined];
    }

    if (numberBoosters !== undefined && typeof numberBoosters !== 'number') {
        return ['argument \`number-boosters\` is not a number', undefined];
    }

    if (numberBoosters === undefined) {
        if (boosters === undefined) {
            return ['arguments \`number-boosters\` and \`boosters\` cannot both be \`undefined\`', undefined];
        }

        if (typeof boosters !== 'string') {
            return ['argument \`boosters\` is not a string (should be a string of space separated user ids)', undefined];
        }

        // split ids, remove empty ids, and filter out ids that are not numbers
        boosterIds = boosters
            .split(' ')
            .filter(e => e !== '')
            .filter(e => +e >= 0);

        numberBoosters = boosterIds.length;
        if (!numberBoosters) {
            return ['argument \`boosters\` should be a space separated list of user ids', undefined];
        }
    }


    // const cutRcu: number = P_CUT_RCU * pot;
    const cutAdvertisers: number = P_CUT_ADVERTISERS * pot;

    const cutCollector: number = P_CUT_COLLECTOR * pot; // from boosters
    const cutRaidLeader: number = P_CUT_RL * pot; // from boosters

    const cutBoosters: number = P_CUT_BOOSTERS * pot - cutCollector - cutRaidLeader;
    const cutByBooster: number = cutBoosters / numberBoosters;

    const boostersNameEmbed: string = boosters
        ? boosterIds.map(id => `${I_SWORD} <@${id}>`).join('\n')
        : Array(numberBoosters).fill(`${I_TANK} <@${interaction.user.id}>`).join('\n');

    const boostersCutEmbed: string = Array(numberBoosters)
        .fill(`${I_GOLD} ${nf.format(cutByBooster)}`)
        .join('\n');

    const boostersRoleEmbed: string = boosters
        ? '\u200b'
        : `${I_TANK} ${numberBoosters} Tank`;

    const data: EmbedData = {
        title: `${I_RAID} | Ashes Amirdrassil | ${I_RAID}`,
        color: 0xf0ad4e,
        fields: [
            {name: 'Status:', value: ':hourglass: Pending...', inline: true},
            {name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: 'Pot:', value: `${I_GOLD} **${nf.format(pot)}**`, inline: true},
            {name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: 'Booster:', value: `${I_GOLD} ${nf.format(cutBoosters)}`, inline: true},
            {name: 'Advertisers:', value: `${I_GOLD} ${nf.format(cutAdvertisers)}`, inline: true},
            {name: 'Gold Collector:', value: `${I_GOLD} ${nf.format(cutCollector)}`, inline: true},
            {name: 'Raidleaders:', value: `${I_CROWN} ${user}`, inline: true},
            {name: 'Cut:', value: `${I_GOLD} ${nf.format(cutRaidLeader)}`, inline: true},
            //{name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: '\u200b', value: '\u200b', inline: true}, // blank cell
            {name: 'Boosters:', value: boostersNameEmbed, inline: true},
            {name: 'Cut:', value: boostersCutEmbed, inline: true},
            {name: `${I_SWORD} ${numberBoosters} Boosters`, value: boostersRoleEmbed, inline: true},
            {name: 'Advertisers:', value: `${I_ADV} _(multiple advertisers)_`, inline: true},
            {name: 'Cut:', value: `${I_GOLD} ${nf.format(cutAdvertisers)}`, inline: true},
            {name: 'Clients:', value: `${numberClients} Clients`, inline: true},
        ],
    };


    const message: string = `${ROLE_BOOSTER} Un admin rcu a marqué le boost ci-dessus comme complété! \
Ce que cela veut dire pour toi, c'est que tu recevras bientôt (à la fin du cycle en cours) la somme de \
${I_GOLD} **${nf.format(cutByBooster)}**.\n\nLes cuts sont calculées automatiquement par rcu via la distribution \
que tu peux trouver sur leur serveur discord \
https://discord.com/channels/658505246410014731/999792306209165412/1128748146747519116.\n\nVoici le détail du boost:`;

    return [message, data];
}

async function clickDelete(interactionButton: ButtonInteraction, replyMessage: any, data: EmbedData) {
    interactionButton.channel!.messages.delete(replyMessage.id);
}

// FIXME useless return values
async function clickApprove(interactionButton: ButtonInteraction, replyMessage: any, data: EmbedData): Promise<[string, string[], string[]]> {
    let replyEmbed: Embed = replyMessage.embeds[0];

    // set status to approved
    replyEmbed.fields![0].value = ':white_check_mark: Approved';

    const newEmbed = new EmbedBuilder({
        title: replyEmbed.title || '',
        description: `\n:id: BoostId \`${interactionButton.message.id}\``,
        color: 0x22bb33,
        fields: replyEmbed.fields,
    });

    // save in db
    const guildId = interactionButton.guildId;
    const boostId: string = replyMessage.id;

    const pot = replyEmbed.fields[3].value
        .split(' ')[1].slice(2, -2).replace(/,/g, '');
    const rl = replyEmbed.fields[9].value
        .split(' ')[1].slice(2, -1);
    const boosters = replyEmbed.fields[12].value
        .split('\n')
        .map((e: string) => e.split(' ')[1].slice(2, -1));
    const amounts = replyEmbed.fields[13].value
        .split('\n')
        .map((e: string) => e.split(' ')[1].replace(/,/g, ''));


    // save in Boost & Transaction
    let entries = [];
    const boost = new Boost({ guildId, boostId, date: Date.now()});
    const rlCut = new Transaction({
        userId: rl,
        guildId: guildId,
        boostId: boostId,
        amount: P_CUT_RL * (+pot),
    });
    for (const [idx, boosterId] of boosters.entries()) {
        entries.push({
            userId: boosterId,
            guildId: guildId,
            boostId: boostId,
            amount: amounts[idx],
        })
    }


    try {
        await Transaction.insertMany(entries);
        await rlCut.save();
        await boost.save();
    } catch (e) {
        await interactionButton.editReply(replyError(`error saving boost/transactions ${e}`))
        return ['', [], []];
    }


    // edit embed
    await replyMessage.edit({
        embeds: [newEmbed],
        components: [],
    });

    return [boostId, boosters, amounts]
}


/**
 * Local custom pcr command
 */
export const pcr: ICommand = {
    name: 'pcr',
    description: 'Generate a guild PCR',
    options: [
        {
            name: 'total-pot',
            description: 'The entire client pot',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'number-clients',
            description: 'The number of clients',
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: 'boosters',
            description: 'A list of boosters',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'number-boosters',
            description: 'The number of boosters',
            type: ApplicationCommandOptionType.Number,
            required: false,
        }
    ],
    devOnly: true,
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        const [msg, data]: [string, EmbedData | undefined] = buildPcr(interaction);
        if (!data) {
            await interaction.reply(replyError(msg));
            return;
        }


        // buttons
        const buttonApprove: any = new ButtonBuilder()
            .setLabel('Approve')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success)
            .setCustomId('pcr.approve');
        const buttonDelete: any = new ButtonBuilder()
            .setLabel('Delete')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('pcr.delete');

        const buttons: any = new ActionRowBuilder().addComponents(buttonApprove, buttonDelete);

        const embed = new EmbedBuilder(data);
        const reply: any = await interaction.reply({content: msg, embeds: [embed], components: [buttons]});

        // collect button clicks & listen for them
        const filter = (i: ButtonInteraction) => i.user.id === UID_WEXUS;
        const collector: InteractionCollector<any> = reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter,
        });

        // NOTE: if the bot restarts, this will not find anything. Any "pending requests"
        // will not resolve when the "approve" button is clicked
        let replyMessage = await interaction.fetchReply();

        collector.on('collect', async (interactionButton: ButtonInteraction) => {
            await interactionButton.deferReply();

            if (interactionButton.customId === 'pcr.delete') {
                await clickDelete(interactionButton, replyMessage, data);

                const resultMessage = `🗑️  Deleted PCR **${data.title}**`;
                logger.info(resultMessage);
                await interactionButton.editReply(replySuccess(resultMessage));
            }

            else if (interactionButton.customId === 'pcr.approve') {
                const [boostId, boosters, amounts] = await clickApprove(interactionButton, replyMessage, data);

                const resultMessage: string = `✅ Approved PCR **${data.title}**`;
                logger.info(resultMessage);
                await interactionButton.editReply(replySuccess(resultMessage));

            } else {
                const resultMessage: string = `unknown button custom id '${interactionButton.customId}'`;
                logger.info(resultMessage);
                await interactionButton.editReply(replySuccess(resultMessage));
            }

        });
    }
}
