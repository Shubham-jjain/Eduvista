import express from "express";
import { body } from "express-validator";
import { register, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

// POST /register — validates input and registers a new user
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        body("role")
            .optional()
            .isIn(["student", "instructor", "admin"])
            .withMessage("Invalid role"),
    ],
    register
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
