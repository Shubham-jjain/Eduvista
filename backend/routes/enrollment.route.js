import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { enrollInCourse, getEnrolledCourses } from "../controllers/enrollment.controller.js";

const router = express.Router();

// GET /my-courses — returns all enrolled courses with progress data (student only)
router.get("/my-courses", authMiddleware, roleMiddleware(["student"]), getEnrolledCourses);

// POST /:courseId — enrolls a student in a published course (student only)
router.post("/:courseId", authMiddleware, roleMiddleware(["student"]), enrollInCourse);

export default router;
