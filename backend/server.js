import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.route.js";

const server = express();
const PORT = 5001;

server.use(express.json());
server.use(cookieParser());
server.use(cors({ origin: "http://localhost:5173", credentials: true }));

server.use("/api/auth", authRoutes);

connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
