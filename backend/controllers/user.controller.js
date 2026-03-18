import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

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
