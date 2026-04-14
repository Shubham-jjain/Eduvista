import express from "express";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import upload from "../middleware/upload.js";
import { getAllCourses, getMyCourses, getCourseById, createCourse, updateCourse, deleteCourse } from "../controllers/course.controller.js";

const router = express.Router();

// GET /my-courses — returns role-based course list for authenticated user
router.get("/my-courses", authMiddleware, getMyCourses);

// GET / — returns all published courses with optional filters
router.get("/", getAllCourses);

// GET /:id — returns a single course with full details (videoUrls stripped for non-enrolled)
router.get("/:id", optionalAuthMiddleware, getCourseById);

// POST / — creates a new course (instructor only)
router.post("/", authMiddleware, roleMiddleware(["instructor"]), upload.single("thumbnail"), createCourse);

// PUT /:id — updates an existing course (instructor owner only)
router.put("/:id", authMiddleware, roleMiddleware(["instructor"]), upload.single("thumbnail"), updateCourse);

// DELETE /:id — deletes a course (owner instructor or admin)
router.delete("/:id", authMiddleware, roleMiddleware(["instructor", "admin"]), deleteCourse);

export default router;
