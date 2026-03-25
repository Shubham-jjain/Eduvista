import express from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { getProfile, updateProfile, updateProfileImage, changePassword } from "../controllers/user.controller.js";

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /profile — returns authenticated user's profile
router.get("/profile", getProfile);

// PUT /profile — updates profile with validated fields
router.put(
    "/profile",
    [
        body("name")
            .optional()
            .notEmpty()
            .withMessage("Name cannot be empty")
            .isLength({ max: 100 })
            .withMessage("Name must be at most 100 characters"),
        body("bio")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Bio must be at most 500 characters"),
        body("expertise").optional(),
    ],
    updateProfile
);

// PUT /profile/image — uploads and updates profile image
router.put("/profile/image", upload.single("profileImage"), updateProfileImage);

// PUT /profile/password — changes the user's password
router.put(
    "/profile/password",
    [
        body("oldPassword").notEmpty().withMessage("Current password is required"),
        body("newPassword")
            .isLength({ min: 8 })
            .withMessage("New password must be at least 8 characters"),
    ],
    changePassword
);

export default router;
