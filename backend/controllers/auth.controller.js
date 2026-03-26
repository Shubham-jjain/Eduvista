import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/emailService.js";

const SALT_ROUNDS = 10;

// Regex for password validation: min 8 chars, 1 letter, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Generates a random 6-digit verification code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// Registers a new user, sends verification code email (no JWT yet)
export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, role } = req.body;

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with 1 letter, 1 number, and 1 special character",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // If unverified user exists with same email, delete and recreate
        if (existingUser && !existingUser.isVerified) {
            await User.deleteOne({ _id: existingUser._id });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const code = generateCode();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "student",
            isVerified: false,
            verificationCode: code,
            verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
        });

        try {
            await sendVerificationEmail(name, email, code);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError.message);
            await User.deleteOne({ _id: user._id });
            return res.status(500).json({ message: "Failed to send verification email. Please try again." });
        }

        res.status(201).json({
            message: "Verification code sent to your email",
            userId: user._id,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Verifies email with 6-digit code, sets JWT cookie, sends welcome email
export const verifyEmail = async (req, res) => {
    try {
        const { userId, code } = req.body;

        const user = await User.findOne({ _id: userId, isVerified: false });
        if (!user) {
            return res.status(400).json({ message: "Invalid request" });
        }

        if (user.verificationCode !== code || user.verificationCodeExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationCodeExpiry = null;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, verificationCode: __, verificationCodeExpiry: ___, ...userData } = user.toObject();

        sendWelcomeEmail(user.name, user.email);

        res.status(200).json({
            message: "Email verified successfully",
            user: userData,
        });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Resends a new 6-digit verification code to the user's email
export const resendCode = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findOne({ _id: userId, isVerified: false });
        if (!user) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const code = generateCode();
        user.verificationCode = code;
        user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail(user.name, user.email, code);
        } catch (emailError) {
            console.error("Failed to resend verification email:", emailError.message);
            return res.status(500).json({ message: "Failed to send verification email. Please try again." });
        }

        res.status(200).json({ message: "New verification code sent" });
    } catch (error) {
        console.error("Resend code error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Authenticates user with email/password, sets JWT cookie
export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email first" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { password: _, ...userData } = user.toObject();

        res.status(200).json({
            message: "Login successful",
            user: userData,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Clears the auth cookie to log user out
export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
};
