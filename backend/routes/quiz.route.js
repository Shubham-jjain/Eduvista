import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { getQuiz, submitQuiz, getQuizAttempt } from "../controllers/quiz.controller.js";

const router = express.Router();

// POST /submit — grades quiz answers and stores latest score
router.post("/submit", authMiddleware, roleMiddleware(["student"]), submitQuiz);

// GET /attempt/:courseId/:sectionId — returns previous attempt for a section
router.get("/attempt/:courseId/:sectionId", authMiddleware, getQuizAttempt);

// GET /:courseId/:sectionId — returns quiz questions without correct answers
router.get("/:courseId/:sectionId", authMiddleware, getQuiz);

export default router;
