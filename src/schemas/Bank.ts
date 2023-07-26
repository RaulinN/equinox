import { Schema, model } from 'mongoose';

const bankSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    realm: {
        type: String,
        required: true,
    },
});

/** MongoDB schema describing a bank character */
export const Bank = model('Bank', bankSchema);
