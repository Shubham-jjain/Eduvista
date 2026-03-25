import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

// Gmail SMTP transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS,
  },
});

export default transporter;
