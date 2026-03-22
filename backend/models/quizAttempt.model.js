import mongoose from "mongoose";

// Schema for storing a student's quiz submission and score
const quizAttemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        sectionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        answers: [
            {
                questionIndex: Number,
                selectedAnswer: Number,
                isCorrect: Boolean,
            },
        ],
        score: {
            type: Number,
        },
        totalQuestions: {
            type: Number,
        },
        percentage: {
            type: Number,
        },
        passed: {
            type: Boolean,
        },
    },
    { timestamps: true }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
