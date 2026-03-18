import mongoose from "mongoose";

// Sub-schema for quizzes with questions array and pass percentage
const quizSchema = new mongoose.Schema({
    questions: [
        {
            question: {
                type: String,
                required: true,
            },
            options: {
                type: [String],
                required: true,
            },
            correctAnswer: {
                type: Number,
                required: true,
            },
        },
    ],
    passPercentage: {
        type: Number,
        default: 50,
    },
});

export default quizSchema;
