import express from "express";
import { body } from "express-validator";
import { register, verifyEmail, resendCode, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// POST /register — validates input and registers a new user (sends OTP)
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters"),
        body("role")
            .optional()
            .isIn(["student", "instructor", "admin"])
            .withMessage("Invalid role"),
    ],
    register
);

// POST /verify-email — verifies the 6-digit email code
router.post(
    "/verify-email",
    [
        body("userId").notEmpty().withMessage("User ID is required"),
        body("code").notEmpty().withMessage("Verification code is required"),
    ],
    verifyEmail
);

// POST /resend-code — resends a new verification code
router.post(
    "/resend-code",
    [body("userId").notEmpty().withMessage("User ID is required")],
    resendCode
);

// POST /login — validates credentials and logs user in
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    login
);

// POST /logout — logs user out
router.post("/logout", logout);

export default router;
