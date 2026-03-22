import mongoose from "mongoose";

// Schema for tracking student progress through a course
const progressSchema = new mongoose.Schema(
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
        completedLessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
            },
        ],
        progressPercentage: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        lastAccessedLesson: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
    },
    { timestamps: true }
);

// Compound unique index — one progress record per student per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;
