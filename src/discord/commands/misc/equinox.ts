import { ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { ICommand } from '../ICommand.js';
import { Embed } from '../../embeds/Embed.js';
import project from '../../../../package.json' assert { type: 'json' };

/**
 * Local custom equinox command
 */
export const equinox: ICommand = {
    name: 'equinox',
    description: 'Equinox technical description and information',
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        const embed = new Embed(bot, {
            description: project.description,
            fields: [
                //{ name: '\u200b', value: '\u200b' },
                { name: 'Name', value: project.name, inline: true },
                { name: 'Version', value: project.version, inline: true },
                { name: 'License', value: project.license, inline: true },
                { name: 'Author', value: project.author },
                { name: 'Repository', value: project.repository.url },
            ],
        });

        interaction.reply({ embeds: [embed.build()] });
    }
}
