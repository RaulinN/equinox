import {
    ActionRowBuilder,
    Client,
    Embed, EmbedBuilder, EmbedData,
    Message,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';
import { logger } from '../../../logger/Logger.js';
import { UID_WEXUS } from '../../utils/index.js';
import { replyError, replySuccess, replyWarn } from '../../embeds/responses.js';
import { Transaction } from '../../../schemas/Transaction.js';
import { Feedback } from '../../../schemas/Feedback.js';

const MODAL_TIME: number = 10 * 60 * 1000;

export default async function handleButtons(bot: Client, interaction: any): Promise<void> {

    if (!interaction.isButton()) return;

    logger.debug(`registered button interaction with customId=${interaction.customId}`);
    if (!interaction.customId) return;

    const id: string = interaction.customId;
    const splitId: string[] = id.split('.');

    try {
        if (splitId[0] === 'payout') {
            if (!interaction.inGuild() || interaction.user.bot) return;

            // checking permissions
            if (interaction.user.id !== UID_WEXUS) {
                await interaction.reply({...replyWarn('Don\'t worry I\'ll handle that \\=) Ces boutons sont là pour ' +
                        'moi afin de pouvoir facilement m\'indiquer qui il me reste à payer'), ephemeral: true});
                return;
            }

            const [cmd, bid, pid, _, n] = splitId;
            if (!cmd || !bid || !pid || !n) {
                await interaction.reply(replyError(`unknown custom id '${id}' while pressing a payout button`));
                return;
            }


            // switch embed emoji
            const payoutMessage: Message = await interaction.channel.messages.fetch(pid);
            const payoutEmbed: Embed = payoutMessage.embeds[0];

            const idx: number = (+n) - 1;
            const boosterPayment = payoutEmbed.fields[0].value.split('\n')
            if (boosterPayment[idx].startsWith(':no_entry_sign:')) {
                boosterPayment[idx] = boosterPayment[idx].replace(':no_entry_sign:', ':white_check_mark:');
            } else {
                boosterPayment[idx] = boosterPayment[idx].replace(':white_check_mark:', ':no_entry_sign:');
            }
            payoutEmbed.fields[0].value = boosterPayment.join('\n');

            const userId = (boosterPayment[idx].split(' ').slice(-1)[0]).slice(2, -1);
            const query = {
                userId: userId,
                guildId: interaction.guildId,
                boostId: bid,
            };

            let instance: any = await Transaction.findOne(query);
            if (!instance) {
                await interaction.reply(replyError(`could not find userId=${query.userId}, guildId=${query.guildId}, boostId=${query.boostId}`));
                return;
            }

            instance.paid = !instance.paid;

            await instance.save();
            await payoutMessage.edit({
                embeds: [payoutEmbed],
            });

            interaction.deferUpdate();
            return;
        } else if (splitId[0] === 'setup-feedback') {
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
            interaction.awaitModalSubmit({ filter, time: MODAL_TIME }).then(async (modalInteraction: any) => {
                const feedbackValue: string = modalInteraction.fields.getTextInputValue(modalInputId);

                const feedback = new Feedback({ userId: modalInteraction.user.id, guildId: modalInteraction.guildId, feedback: feedbackValue, date: Date.now() });
                await feedback.save();

                const data: EmbedData = {
                    title: 'Un feedback sauvage apparaît!',
                    description: feedbackValue,
                    color: 0x5bc0de,
                };
                const embed = new EmbedBuilder(data);

                (bot.channels.cache.get(notifChannelId) as TextChannel).send({ embeds: [embed] });
                modalInteraction.reply({ content: 'Ton feedback a été envoyé anonymement!', ephemeral: true });
            }).catch((err: any) => logger.error(err));
        }
    } catch (e) {
        await interaction.reply(replyError(`error while handling button interaction customId=${id}: ${e}`));
    }
}
