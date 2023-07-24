import { Client, EmbedBuilder, EmbedData } from 'discord.js';
import project from '../../../package.json' assert { type: 'json' };

/** */
export class Embed {
    readonly #data: EmbedData;

    constructor(bot: Client, data: EmbedData) {
        this.#data = {
            author: {
                name: bot.user!.username,
                url: project.repository.url,
                iconURL: bot.user!.displayAvatarURL({ size: 256 })
            },
            timestamp: new Date().toISOString(),
            ...data,
        };
    }

    public build(): EmbedBuilder {
        return new EmbedBuilder(this.#data);
    }
}
