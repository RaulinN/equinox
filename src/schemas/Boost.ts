import { model, Schema } from 'mongoose';

const boostSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    boostId: { // the message id of the PCR
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
});

/** MongoDB schema describing a boost run */
export const Boost = model('Boost', boostSchema);
