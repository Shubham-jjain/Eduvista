import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { createReview, getReviewsByCourse, updateReview, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();

// POST / — create a new review (enrolled students only)
router.post("/", authMiddleware, roleMiddleware(["student"]), createReview);

// GET /:courseId — get all reviews for a course (public)
router.get("/:courseId", getReviewsByCourse);

// PUT /:reviewId — update own review
router.put("/:reviewId", authMiddleware, updateReview);

// DELETE /:reviewId — delete own review or admin delete
router.delete("/:reviewId", authMiddleware, deleteReview);

export default router;
