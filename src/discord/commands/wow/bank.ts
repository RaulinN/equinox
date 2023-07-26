import { ApplicationCommandOptionType, ChatInputCommandInteraction, Client } from 'discord.js';
import { ICommand } from '../ICommand.js';
import { I_GOLD } from '../../utils/index.js';
import { replyError, replyOk } from '../../embeds/responses.js';
import { logger } from '../../../logger/Logger.js';
import { Bank } from '../../../schemas/Bank.js';

// realms connected to Dalaran
const CONNECTED_REALMS: string[] = ['Dalaran', 'MarécagedeZangar', 'Cho\'gall', 'Eldre\'Thalas', 'Sinstralis'];

/**
 * Local custom bank command
 */
export const bank: ICommand = {
    name: 'bank',
    description: 'Change information related to payment characters',
    options: [
        {
            name: 'name',
            description: 'Name of the character',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'realm',
            description: 'Realm of the character',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    // TODO need booster role
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        await interaction.deferReply({ ephemeral: true });

        // character name
        let name = interaction.options.get('name')!.value;
        if (typeof name !== 'string') {
            await interaction.editReply(replyError("argument \`name\` is not a string"))
                .catch(e => logger.error(`failed to reply: ${e}`));
            return;
        }
        // character realm
        let realm = interaction.options.get('realm')!.value;
        if (typeof realm !== 'string') {
            await interaction.editReply(replyError("argument \`realm\` is not a string"))
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
                const newBank = new Bank({ ...query, name, realm });
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





/*
        const bank = new Bank({
            userId: interaction.user.id,
            guildId: interaction.guildId,
            name: name,
            realm: realm,
        });
        await bank.save().catch(async (e) => {
            await interaction.editReply(replyError(`error saving updated bank ${e}`))
                .catch(e => logger.error(`failed to reply: ${e}`));
            return;
        });*/




        const response: string = `Ton personnage sur lequel j'enverrai tes ${I_GOLD} golds est maintenant : \
\`${name}-${realm}\` !\n\n<:noted:996585301935923290> Check bien que ces données sont correctes! Pas de refund si \
les ${I_GOLD} sont envoyés à Narnia \\:s`;

        await interaction.editReply(replyOk(response)).catch(e => logger.error(`failed to reply: ${e}`));
    }
}
