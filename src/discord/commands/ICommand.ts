import { ApplicationCommandOptionType, Client, PermissionFlagsBits } from 'discord.js';

/** Interface describing an option for a bot command */
export interface ICommandOption {
    name: string,
    description: string,
    required?: boolean,
    choices?: any,
    type: ApplicationCommandOptionType
}

/** Interface describing a bot command */
export interface ICommand {
    name: string,
    description: string,
    devOnly?: boolean,
    testOnly?: boolean,
    options?: ICommandOption[],
    permissionsRequired?: (typeof PermissionFlagsBits)[],
    botPermissions?: (typeof PermissionFlagsBits)[],
    deleted?: boolean,
    callback: (bot: Client, interaction: any) => void,

    // context menu
    type?: ApplicationCommandOptionType,
}
