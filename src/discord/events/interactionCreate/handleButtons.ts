import {
    ActionRowBuilder,
    Client,
    EmbedBuilder,
    EmbedData,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { logger } from '../../../logger/Logger.js';
import { replyError } from '../../embeds/responses.js';
import { Feedback } from '../../../schemas/Feedback.js';

const MODAL_TIME: number = 10 * 60 * 1000;

export default async function handleButtons(bot: Client, interaction: any): Promise<void> {

    if (!interaction.isButton()) return;

    logger.debug(`registered button interaction with customId=${interaction.customId}`);
    if (!interaction.customId) return;

    const id: string = interaction.customId;
    const splitId: string[] = id.split('.');

    try {
        if (splitId[0] === 'setup-feedback') {
            const sourceChannelId: string = splitId[1];
            const notifChannelId: string = splitId[2];


            // create a feedback modal
            const modalId: string = `modal.feedback.${interaction.user.id}`;
            const modal = new ModalBuilder({
                customId: modalId,
                title: 'Envoyer un feedback',
            });

            const modalInputId: string = `modal.feedback.input.${interaction.user.id}`;
            const input: TextInputBuilder = new TextInputBuilder({
                customId: modalInputId,
                label: 'Feedback / Idée',
                style: TextInputStyle.Paragraph,
            });

            const row: ActionRowBuilder = new ActionRowBuilder().addComponents(input as any);
            modal.addComponents(row as any);

            await interaction.showModal(modal);

            const filter = (interaction: any) => interaction.customId === modalId;
            interaction.awaitModalSubmit({filter, time: MODAL_TIME}).then(async (modalInteraction: any) => {
                const feedbackValue: string = modalInteraction.fields.getTextInputValue(modalInputId);

                const feedback = new Feedback({
                    userId: modalInteraction.user.id,
                    guildId: modalInteraction.guildId,
                    feedback: feedbackValue,
                    date: Date.now()
                });
                await feedback.save();
                logger.debug(`Nouveau feedback de ${modalInteraction.user.id} : ${feedbackValue}`);

                const data: EmbedData = {
                    title: 'Un feedback sauvage apparaît!',
                    description: feedbackValue,
                    color: 0x5bc0de,
                };
                const embed = new EmbedBuilder(data);

                (bot.channels.cache.get(notifChannelId) as TextChannel).send({embeds: [embed]});
                modalInteraction.reply({content: 'Ton feedback a été envoyé anonymement!', ephemeral: true});
            }).catch((err: any) => logger.error(err));
        }
    } catch (e) {
        await interaction.reply(replyError(`error while handling button interaction customId=${id}: ${e}`));
    }
}
