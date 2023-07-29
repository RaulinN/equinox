import { model, Schema } from 'mongoose';

const transactionSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    boostId: { // the message id of the PCR
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paid: {
        type: Boolean,
        required: true,
        default: false,
    }
});

/** MongoDB schema describing a transaction */
export const Transaction = model('Transaction', transactionSchema);
