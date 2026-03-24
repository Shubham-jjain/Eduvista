import mongoose from "mongoose";

// Schema for storing student reviews and ratings for courses
const reviewSchema = new mongoose.Schema(
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound unique index — one review per student per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
