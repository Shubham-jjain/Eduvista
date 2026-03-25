import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

const SALT_ROUNDS = 10;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Returns the authenticated user's profile (excluding password)
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates user's name, bio, and expertise fields
export const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, bio, expertise } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (bio !== undefined) updateData.bio = bio;
        if (expertise !== undefined) {
            updateData.expertise = Array.isArray(expertise)
                ? expertise
                : expertise.split(",").map((s) => s.trim()).filter(Boolean);
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Uploads profile image to Cloudinary and saves the URL
export const updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: "eduvista/profiles",
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face",
        });

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { profileImage: result.secure_url },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile image updated successfully", user });
    } catch (error) {
        console.error("Update profile image error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Changes the user's password after verifying the old password
export const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters with 1 letter, 1 number, and 1 special character",
            });
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
