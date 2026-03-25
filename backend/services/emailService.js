import transporter from "../config/nodemailer.js";

// Sends a 6-digit verification code for email confirmation during signup
export const sendVerificationEmail = async (name, email, code) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Your EduVista Verification Code",
    text: `Hi ${name},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, you can safely ignore this email.\n\n— EduVista`,
  });
  console.log(`Verification email sent to ${email}`);
};
