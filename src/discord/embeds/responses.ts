import { EmbedBuilder, EmbedData } from 'discord.js';

const contactDeveloper: string = `\n\n:grey_question: si tu penses qu'il s'agit d'une erreur de ma part, contacte <@214381434784186378>`;

/**
 * Generate a warning response (embed) for the bot
 *
 * @param reason - reason the warning occurred
 */
export function replyWarn(reason: string): any {
    const data: EmbedData = {
        title: `:warning: Un avertissement est survenu :warning:`,
        description: reason + contactDeveloper,
        color: 0xf0ad4e,
    };
    const embed = new EmbedBuilder(data);
    return {embeds: [embed]};
}

/**
 * Generate an error response (embed) for the bot
 *
 * @param reason - reason the error occurred
 */
export function replyError(reason: string): any {
    const data: EmbedData = {
        title: `:no_entry_sign: Une erreur est survenue :no_entry_sign:`,
        description: reason + contactDeveloper,
        color: 0xbb2124,
    };
    const embed = new EmbedBuilder(data);
    return {embeds: [embed]};
}

/**
 * Generate an ok response (embed) for the bot
 *
 * @param information - information of what went ok
 */
export function replyOk(information: string): any {
    const data: EmbedData = {
        description: information,
        color: 0x5bc0de,
    };
    const embed = new EmbedBuilder(data);
    return {embeds: [embed]};
}

/**
 * Generate a success response (embed) for the bot
 *
 * @param information - information of what was successful
 */
export function replySuccess(information: string): any {
    const data: EmbedData = {
        description: information,
        color: 0x22bb33,
    };
    const embed = new EmbedBuilder(data);
    return {embeds: [embed]};
}
