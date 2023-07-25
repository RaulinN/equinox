import { ICommand } from '../ICommand.js';
import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, EmbedBuilder, EmbedData } from 'discord.js';

const I_RAID: string = '<:raid:1133092256979624048>';
const I_CROWN: string = ':crown:';
const I_GOLD: string = '<:gold:1133089695178444811>';
const I_ADV: string = '<:advertiser:1133188937800757349>';
const I_SWORD: string = ':crossed_swords:';
const I_TANK: string = '<:tank:1133092404598149141>';

const P_CUT_BOOSTERS: number = 0.625;
const P_CUT_ADVERTISERS: number = 0.275;
// const P_CUT_RCU: number = 1 - P_CUT_BOOSTERS - P_CUT_ADVERTISERS;

const P_CUT_COLLECTOR: number = 0.01;
const P_CUT_RL: number = 0.035;

const ROLE_BOOSTER: string = '<@&1131932731836731452>';


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
        let nf = new Intl.NumberFormat('en-US');

        // total pot
        let pot = interaction.options.get('total-pot')!.value;
        if (typeof pot !== 'number') {
            interaction.editReply("argument 'total-pot' is not a number");
            return;
        }
        // number of clients
        const numberClients = interaction.options.get('number-clients')!.value;
        if (typeof numberClients !== 'number') {
            interaction.editReply("argument 'number-clients' is not a number");
            return;
        }


        // user that executed the command
        const user: string = `<@${interaction.user.id}>`;
        // number of boosters
        let numberBoosters = interaction.options.get('number-boosters')?.value;
        // boosters
        const boosters = interaction.options.get('boosters')?.value;
        let boosterIds: string[] = [];


        if (numberBoosters !== undefined && boosters !== undefined) {
            interaction.editReply("arguments 'number-boosters' and 'boosters' are mutually exclusive");
            return;
        }

        if (numberBoosters !== undefined && typeof numberBoosters !== 'number') {
            interaction.editReply("argument 'number-boosters' is not a number");
            return;
        }

        if (numberBoosters === undefined) {
            if (boosters === undefined) {
                interaction.editReply("arguments 'number-boosters' and 'boosters' cannot both be _undefined_");
                return;
            }

            if (typeof boosters !== 'string') {
                interaction.editReply("argument 'boosters' is not a string (should be a string of space separated user ids)");
                return;
            }

            // split ids, remove empty ids, and filter out ids that are not numbers
            boosterIds = boosters
                .split(' ')
                .filter(e => e !== "")
                .filter(e => +e >= 0);

            numberBoosters = boosterIds.length;
            if (!numberBoosters) {
                interaction.editReply("argument 'boosters' should be a space separated list of user ids");
                return;
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
            title: `${I_RAID} | Ashes HC | ${I_RAID}`,
            description: 'Type: Heroic',
            fields: [
                { name: 'Pot:', value: `${I_GOLD} **${nf.format(pot)}**`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // blank cell
                { name: '\u200b', value: '\u200b', inline: true }, // blank cell
                { name: 'Booster:', value: `${I_GOLD} ${nf.format(cutBoosters)}`, inline: true },
                { name: 'Advertisers:', value: `${I_GOLD} ${nf.format(cutAdvertisers)}`, inline: true },
                { name: 'Gold Collector:', value: `${I_GOLD} ${nf.format(cutCollector)}`, inline: true },
                { name: 'Raidleaders:', value: `${I_CROWN} ${user}`, inline: true },
                { name: 'Cut:', value: `${I_GOLD} ${nf.format(cutRaidLeader)}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true }, // blank cell
                { name: 'Boosters:', value: boostersNameEmbed, inline: true },
                { name: 'Cut:', value: boostersCutEmbed, inline: true },
                { name: `${I_SWORD} ${numberBoosters} Boosters`, value: boostersRoleEmbed, inline: true },
                { name: 'Advertisers:', value: `${I_ADV} _(multiple advertisers)_`, inline: true },
                { name: 'Cut:', value: `${I_GOLD} ${nf.format(cutAdvertisers)}`, inline: true },
                { name: 'Clients:', value: `${numberClients} Clients`, inline: true },
            ],
        };

        const embed = new EmbedBuilder(data)

        const message: string = `${ROLE_BOOSTER} Un admin rcu a marqué le boost ci-dessus comme complété! \
Ce que cela veut dire pour toi, c'est que tu recevras bientôt (à la fin du cycle en cours) la somme de \
${I_GOLD} **${nf.format(cutByBooster)}**.\n\nLes cuts sont calculées automatiquement par rcu via la distribution \
que tu peux trouver sur leur serveur discord \
https://discord.com/channels/658505246410014731/999792306209165412/1128748146747519116.\n\nVoici le détail du boost:`;

        await interaction.reply({ content: message, embeds: [embed] });
    }
}
