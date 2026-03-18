import mongoose from "mongoose";

// Sub-schema for lessons with title, videoUrl, notes, and duration
const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
        default: "",
    },
    notes: {
        type: String,
        default: "",
    },
    duration: {
        type: Number,
        default: 0,
    },
});

export default lessonSchema;
