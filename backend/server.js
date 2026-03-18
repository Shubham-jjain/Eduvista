import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import courseRoutes from "./routes/course.route.js";

const server = express();
const PORT = 5001;

// Global middleware: JSON parsing, cookies, and CORS
server.use(express.json());
server.use(cookieParser());
server.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Mount API route handlers
server.use("/api/auth", authRoutes);
server.use("/api/user", userRoutes);
server.use("/api/courses", courseRoutes);

// Initialize MongoDB connection
connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
