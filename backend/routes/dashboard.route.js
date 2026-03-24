import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import {
  getStudentStats,
  getContinueLearning,
  getRecentQuizzes,
  getStudentCourses,
  getInstructorStats,
  getCoursePerformance,
  getInstructorRecentReviews,
  getInstructorRecentEnrollments,
  getAdminStats,
  getUserBreakdown,
  getUsers,
  toggleUserStatus,
  changeUserRole,
  getAdminCourses,
  deleteAdminCourse,
  getTopCourses,
  getRecentActivity,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// Student dashboard routes
router.get("/student/stats", authMiddleware, roleMiddleware(["student"]), getStudentStats);
router.get("/student/continue-learning", authMiddleware, roleMiddleware(["student"]), getContinueLearning);
router.get("/student/recent-quizzes", authMiddleware, roleMiddleware(["student"]), getRecentQuizzes);
router.get("/student/courses", authMiddleware, roleMiddleware(["student"]), getStudentCourses);

// Instructor dashboard routes
router.get("/instructor/stats", authMiddleware, roleMiddleware(["instructor"]), getInstructorStats);
router.get("/instructor/course-performance", authMiddleware, roleMiddleware(["instructor"]), getCoursePerformance);
router.get("/instructor/recent-reviews", authMiddleware, roleMiddleware(["instructor"]), getInstructorRecentReviews);
router.get("/instructor/recent-enrollments", authMiddleware, roleMiddleware(["instructor"]), getInstructorRecentEnrollments);

// Admin dashboard routes
router.get("/admin/stats", authMiddleware, roleMiddleware(["admin"]), getAdminStats);
router.get("/admin/user-breakdown", authMiddleware, roleMiddleware(["admin"]), getUserBreakdown);
router.get("/admin/users", authMiddleware, roleMiddleware(["admin"]), getUsers);
router.put("/admin/users/:id/status", authMiddleware, roleMiddleware(["admin"]), toggleUserStatus);
router.put("/admin/users/:id/role", authMiddleware, roleMiddleware(["admin"]), changeUserRole);
router.get("/admin/courses", authMiddleware, roleMiddleware(["admin"]), getAdminCourses);
router.delete("/admin/courses/:id", authMiddleware, roleMiddleware(["admin"]), deleteAdminCourse);
router.get("/admin/top-courses", authMiddleware, roleMiddleware(["admin"]), getTopCourses);
router.get("/admin/recent-activity", authMiddleware, roleMiddleware(["admin"]), getRecentActivity);

export default router;
