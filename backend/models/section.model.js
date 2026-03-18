import mongoose from "mongoose";
import lessonSchema from "./lesson.model.js";
import quizSchema from "./quiz.model.js";

// Sub-schema for course sections containing lessons and an optional quiz
const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    lessons: [lessonSchema],
    quiz: {
        type: quizSchema,
        default: null,
    },
});

export default sectionSchema;
