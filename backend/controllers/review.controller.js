import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Course from "../models/course.model.js";

// Recalculates and updates the average rating and count for a course
const recalculateCourseRating = async (courseId) => {
    const result = await Review.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const average = result.length > 0 ? Math.round(result[0].average * 10) / 10 : 0;
    const count = result.length > 0 ? result[0].count : 0;

    await Course.findByIdAndUpdate(courseId, {
        "rating.average": average,
        "rating.count": count,
    });
};

// Creates a new review for a course (enrolled students only)
export const createReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, rating, comment } = req.body;

        if (!courseId || !rating || !comment) {
            return res.status(400).json({ message: "Course ID, rating, and comment are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (!course.studentsEnrolled.includes(userId)) {
            return res.status(403).json({ message: "You must be enrolled in this course to leave a review" });
        }

        const existingReview = await Review.findOne({ user: userId, course: courseId });
        if (existingReview) {
            return res.status(409).json({ message: "You have already reviewed this course" });
        }

        const review = await Review.create({
            user: userId,
            course: courseId,
            rating,
            comment,
        });

        await recalculateCourseRating(courseId);

        const populated = await Review.findById(review._id).populate("user", "name profileImage");

        res.status(201).json({ message: "Review submitted successfully", review: populated });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns all reviews for a specific course
export const getReviewsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.find({ course: courseId })
            .populate("user", "name profileImage")
            .sort({ createdAt: -1 });

        res.status(200).json({ reviews });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates an existing review (owner only)
export const updateReview = async (req, res) => {
    try {
        const { userId } = req.user;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to update this review" });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;
        await review.save();

        await recalculateCourseRating(review.course);

        const populated = await Review.findById(review._id).populate("user", "name profileImage");

        res.status(200).json({ message: "Review updated successfully", review: populated });
    } catch (error) {
        console.error("Update review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Deletes a review (owner or admin)
export const deleteReview = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== userId && role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        const courseId = review.course;
        await Review.findByIdAndDelete(reviewId);

        await recalculateCourseRating(courseId);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
