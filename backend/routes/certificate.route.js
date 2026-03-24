import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { generateCertificate } from "../controllers/certificate.controller.js";

const router = express.Router();

// GET /:courseId — generate and download certificate PDF (student only)
router.get("/:courseId", authMiddleware, roleMiddleware(["student"]), generateCertificate);

export default router;
