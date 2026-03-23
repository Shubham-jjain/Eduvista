import mongoose from "mongoose";

// Schema for storing mock payment records when students purchase paid courses
const paymentSchema = new mongoose.Schema(
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
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            default: "success",
        },
        transactionId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
