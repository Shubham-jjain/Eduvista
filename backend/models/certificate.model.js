import mongoose from "mongoose";

// Schema for storing certificate records issued to students upon course completion
const certificateSchema = new mongoose.Schema(
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
        certificateId: {
            type: String,
            required: true,
            unique: true,
        },
        issuedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Compound unique index — one certificate per student per course
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;
