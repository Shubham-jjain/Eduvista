import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { markLessonComplete, updateLastAccessed, getProgress } from "../controllers/progress.controller.js";

const router = express.Router();

// POST /lesson-complete — marks a lesson as done and recalculates progress
router.post("/lesson-complete", authMiddleware, roleMiddleware(["student"]), markLessonComplete);

// PUT /last-accessed — updates the last accessed lesson for resume
router.put("/last-accessed", authMiddleware, roleMiddleware(["student"]), updateLastAccessed);

// GET /:courseId — returns progress for a specific course (must be last to avoid param conflicts)
router.get("/:courseId", authMiddleware, roleMiddleware(["student"]), getProgress);

export default router;
