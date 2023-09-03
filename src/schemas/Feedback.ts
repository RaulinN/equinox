import { model, Schema } from 'mongoose';

const feedbackSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    feedback: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
});

/** MongoDB schema describing a feedback */
export const Feedback = model('Feedback', feedbackSchema);
