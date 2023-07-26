import { Client, GuildMember } from 'discord.js';
import { getLocalCommands } from '../../utils/index.js';
import { ICommand } from '../../commands/ICommand.js';
import config from '../../../../config.json' assert { type: 'json' };
import { logger } from '../../../logger/Logger.js';

/**
 * Discord bot 'handleCommands' event that processes user commands. It
 * is automatically called upon receiving a command
 *
 * @param bot – discord.js client
 * @param interaction - ChatInputCommandInteraction command
 *
 * @note the export default is important as we are using ES6 dynamic default imports
 * @note registered via `eventHandler.ts`
 */
export default async function handleCommands(bot: Client, interaction: any): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    logger.info(
        `processing chat input command '${interaction}' by userId ${interaction.user.id} in guild ${interaction.member?.guild?.name}
    `);

    const localCommands: ICommand[] = await getLocalCommands();

    try {
        const commandObject: ICommand | undefined = localCommands.find(
            (cmd: ICommand) => cmd.name === interaction.commandName
        );

        // if the command does not exist, exit
        if (!commandObject) return;

        // command that can only be run by a dev (see config.json)
        if (commandObject.devOnly) {
            // FIXME if sending slash command in dms, (interaction.member as GuildMember) will be null
            if (!config.devs.includes((interaction.member as GuildMember).id)) {
                interaction.reply({
                    content: 'only developers are allowed to run this command',
                    ephemeral: true,
                });
                return;
            }
        }

        // command that can only be run on the testServer (see config.json)
        if (commandObject.testOnly) {
            // FIXME if sending slash command in dms, (interaction.member as GuildMember) will be null
            if (!((interaction.member as GuildMember).guild.id === config.testServer)) {
                interaction.reply({
                    content: 'this command cannot be ran here',
                    ephemeral: true,
                });
                return;
            }
        }

        // TODO not tested
        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'not enough permissions',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        // TODO not tested
        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const b = interaction.guild.members.me;
                if (!b.permissions.has(permission)) {
                    interaction.reply({
                        content: 'I do not have enough permissions',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        await commandObject.callback(bot, interaction);

    } catch (e) {
        logger.error(`error running the command '${interaction}': ${e}`);
    }
}
