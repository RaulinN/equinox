import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    EmbedData
} from 'discord.js';
import { ICommand } from '../ICommand.js';

/**
 * Local custom setupFeedback command
 */
export const setupFeedback: ICommand = {
    name: 'setup-feedback',
    description: 'Setup feedback channel',
    devOnly: true,
    options: [
        {
            name: 'announcement-channel',
            description: 'Notification channel',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        }
    ],
    callback: async (bot: Client, interaction: ChatInputCommandInteraction) => {
        if (!interaction.inGuild() || interaction.user.bot) return;

        await interaction.deferReply();

        const sourceChannelId: string = interaction.channelId;
        const notifChannelId: string = interaction.options.get('announcement-channel')!.value as string;

        let row: any = new ActionRowBuilder().addComponents((new ButtonBuilder()
                .setEmoji('✉️')
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`setup-feedback.${sourceChannelId}.${notifChannelId}`)
        ) as any);

        const description: string = 'Clique sur le bouton ci-dessous pour envoyer un **feedback / idée** aux off =)\n\n \
C\'est un système **anonyme** qui permet de proposer des solutions entre les différents retours rosters officiels\n\n \
Voici des exemples de discussions:\n\
:small_orange_diamond: Feedback sur le **raid** / **raidleading**\n\
:small_orange_diamond: Feedback sur l\'**ambiance** dans la guilde\n\
:small_orange_diamond: Propositions sur comment s\'**améliorer** en général\n\
:small_orange_diamond: Vider ton sac / parler **librement**';

        const data: EmbedData = {
            title: 'Envoyer un feedback aux officiers d\'Ashes',
            description,
            thumbnail: {
                url: 'https://media.discordapp.net/attachments/1028306743240970401/1028306828045582447/cute_dh.png?width=1082&height=984'
            },
            color: 0x5bc0de,
        };
        const embed = new EmbedBuilder(data);

        await interaction.editReply({embeds: [embed], components: [row]});
    }
}
