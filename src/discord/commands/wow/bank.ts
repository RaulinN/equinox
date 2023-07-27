import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client, EmbedBuilder, EmbedData } from 'discord.js';
import { I_GOLD, I_SWORD } from '../../utils/index.js';
import { replyError, replyOk, replyWarn } from '../../embeds/responses.js';
import { logger } from '../../../logger/Logger.js';
import { Bank } from '../../../schemas/Bank.js';

// subcommands
const SUB_SET: string = 'set';
const SUB_SET_ARG_NAME: string = 'name';
const SUB_SET_ARG_REALM: string = 'realm';
const SUB_SHOW: string = 'show';
const SUB_LIST: string = 'list';
const SUB_LIST_ARG_IDS: string = 'booster-ids';

// realms connected to Dalaran
const CONNECTED_REALMS: string[] = ['Dalaran', 'MarécagedeZangar', 'Cho\'gall', 'Eldre\'Thalas', 'Sinstralis'];

async function handleBankSet(bot: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ephemeral: true});

    // character name
    let name = interaction.options.get(SUB_SET_ARG_NAME)!.value;
    if (typeof name !== 'string') {
        await interaction.editReply(replyError(`argument \`${SUB_SET_ARG_NAME}\` is not a string`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }
    // character realm
    let realm = interaction.options.get(SUB_SET_ARG_REALM)!.value;
    if (typeof realm !== 'string') {
        await interaction.editReply(replyError(`argument \`${SUB_SET_ARG_REALM}\` is not a string`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }

    // check that the realm is connected to Dalaran
    if (!CONNECTED_REALMS.includes(realm)) {
        const reason: string = `Je ne peux pas envoyer de ${I_GOLD} sur le royaume \`${realm}\` car il est mal \
orthographié, ou alors non connecté à \`Dalaran\`. Voici la liste des royaumes possibles:\n\n\`[${CONNECTED_REALMS}]\``;
        await interaction.editReply(replyError(reason)).catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }


    // check if the user already bound a character on this server
    const query = {
        userId: interaction.user.id,
        guildId: interaction.guildId,
    };

    try {
        let instance: any = await Bank.findOne(query);

        if (instance) {
            instance.name = name;
            instance.realm = realm;

            await instance.save().catch(async (e: any) => {
                await interaction.editReply(replyError(`error saving updated bank ${e}`))
                    .catch(e => logger.error(`failed to reply: ${e}`));
                return;
            });

            logger.debug(`modified an entry to ${instance} in Bank db`);
        }

        // if !instance
        else {
            const newBank = new Bank({...query, name, realm});
            await newBank.save().catch(async (e) => {
                await interaction.editReply(replyError(`error saving new bank ${e}`))
                    .catch(e => logger.error(`failed to reply: ${e}`));
                return;
            });

            logger.debug(`added entry ${newBank} in Bank db`);
        }

    } catch (error) {
        await interaction.editReply(replyError(`error saving bank ${error}`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }


    const response: string = `Ton personnage sur lequel j'enverrai tes ${I_GOLD} golds est maintenant : \
\`${name}-${realm}\` !\n\n<:noted:996585301935923290> Check bien que ces données sont correctes! Pas de refund si \
les ${I_GOLD} sont envoyés à Narnia \\:s`;

    await interaction.editReply(replyOk(response)).catch(e => logger.error(`failed to reply: ${e}`));
}

async function handleBankShow(bot: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ephemeral: true});

    try {
        let instance: any = await Bank.findOne({
            userId: interaction.user.id,
            guildId: interaction.guildId,
        });

        if (instance) {
            const response: string = `Ton personnage-banque sur ce serveur est :bank: \`${instance.name}-${instance.realm}\``;
            await interaction.editReply(replyOk(response)).catch(e => logger.error(`failed to reply: ${e}`));
            return;
        }

        // if !instance
        else {
            const response: string = `Tu n'as aucun personnage-banque défini sur ce serveur`;
            await interaction.editReply(replyOk(response)).catch(e => logger.error(`failed to reply: ${e}`));
            return;
        }

    } catch (error) {
        await interaction.editReply(replyError(`error fetching bank ${error}`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }
}

async function handleBankList(bot: Client, interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ephemeral: true});

    // FIXME temporary while discord does not allow subcommand permissions
    if (interaction.user.id !== '214381434784186378') {
        await interaction.editReply(replyWarn(`Cette commande est réservée au postier des ${I_GOLD} \\=)`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }

    // boosters
    const boosters = interaction.options.get('booster-ids')?.value;
    let boosterIds: string[] = [];


    try {
        let instances: any = await Bank.find({
            guildId: interaction.guildId,
        });

        // if an argument was given, list a subset of banks only
        if (boosters) {
            if (typeof boosters !== 'string') {
                await interaction.editReply(replyError('argument \`booster-ids\` is not a string (should be a string of space separated user ids)'))
                    .catch(e => logger.error(`failed to reply: ${e}`));
                return;
            }

            // split ids, remove empty ids, and filter out ids that are not numbers
            boosterIds = boosters.split(' ').filter(e => e !== '').filter(e => +e >= 0);
            instances = instances.filter((b: any) => boosterIds.includes(b.userId));
        }


        // if there is no bank, or if they were all filtered
        if (!instances.length) {
            await interaction.editReply(replyOk('Aucune instance trouvée'))
                .catch(e => logger.error(`failed to reply: ${e}`));
            return;
        }

        const names: string[] = instances.map((b: any) => b.name);
        const realms: string[] = instances.map((b: any) => b.realm);
        const banks = names.map((k: string, i: number) => `\`${k}-${realms[i]}\``);

        const embed = new EmbedBuilder({
            title: `:bank: | Gold banks | :bank:`,
            description: `Type: ${boosters ? '\`selective\`' : '\`full guild\`'}`,
            fields: [
                {name: 'userId', value: instances.map((b: any) => `${I_SWORD} <@${b.userId}>`).join('\n'), inline: true},
                {name: 'bank', value: banks.join('\n'), inline: true},
            ],
        });

        await interaction.editReply({embeds: [embed]}).catch(e => logger.error(`failed to reply: ${e}`));

    } catch (error) {
        await interaction.editReply(replyError(`error fetching banks ${error}`))
            .catch(e => logger.error(`failed to reply: ${e}`));
        return;
    }
}

/**
 * Local custom bank command
 */
export const bank: any = {
    name: 'bank',
    description: 'Commande liée à la gestion des personnages-banque',
    options: [
        {
            name: SUB_SET,
            description: 'Définir ton personnage-banque',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: SUB_SET_ARG_NAME,
                    description: 'Nom du personnage',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
                {
                    name: SUB_SET_ARG_REALM,
                    description: 'Royaume du personnage',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                },
            ],
        },
        {
            name: SUB_SHOW,
            description: 'Afficher ton personnage-banque',
            type: ApplicationCommandOptionType.Subcommand,
        },
        {
            name: SUB_LIST,
            description: 'List bank characters',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: SUB_LIST_ARG_IDS,
                    description: 'Space separated list of userIds',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                },
            ],
        },
    ],

    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        switch (interaction.options.getSubcommand()) {
            case SUB_SET:
                await handleBankSet(bot, interaction);
                return;
            case SUB_SHOW:
                await handleBankShow(bot, interaction);
                return;
            case SUB_LIST:
                await handleBankList(bot, interaction);
                return;
            default:
                await interaction.reply(replyError(`subcommand \`${interaction.options.getSubcommand()}\` does not exist`))
                    .catch(e => logger.error(`failed to reply: ${e}`));
                return;
        }
    }
}
