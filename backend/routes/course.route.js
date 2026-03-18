import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMyCourses } from "../controllers/course.controller.js";

const router = express.Router();

// GET /my-courses — returns role-based course list for authenticated user
router.get("/my-courses", authMiddleware, getMyCourses);

export default router;
