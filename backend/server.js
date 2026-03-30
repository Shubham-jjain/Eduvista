import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import courseRoutes from "./routes/course.route.js";
import enrollmentRoutes from "./routes/enrollment.route.js";
import progressRoutes from "./routes/progress.route.js";
import quizRoutes from "./routes/quiz.route.js";
import certificateRoutes from "./routes/certificate.route.js";
import reviewRoutes from "./routes/review.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";

const server = express();
const PORT = process.env.PORT || 5001;

// Allowed CORS origins: comma-separated in env (e.g. "https://a.com,https://b.com")
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map(o => o.trim());

// Global middleware: JSON parsing, cookies, and CORS
server.use(express.json());
server.use(cookieParser());
server.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith("-shubham-jjains-projects.vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));

// Mount API route handlers
server.use("/api/auth", authRoutes);
server.use("/api/user", userRoutes);
server.use("/api/courses", courseRoutes);
server.use("/api/enroll", enrollmentRoutes);
server.use("/api/progress", progressRoutes);
server.use("/api/quiz", quizRoutes);
server.use("/api/certificate", certificateRoutes);
server.use("/api/reviews", reviewRoutes);
server.use("/api/dashboard", dashboardRoutes);

// Initialize MongoDB connection
connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
