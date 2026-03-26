import transporter from "../config/nodemailer.js";

// Reusable branded HTML email wrapper
const wrap = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color: #1E3A8A; padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 26px; font-weight: 700; letter-spacing: 0.5px;">EduVista</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 32px 28px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">${title}</h2>
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; color: #6B7280; font-size: 13px;">EduVista — Online Learning Platform</p>
              <p style="margin: 4px 0 0 0; color: #9CA3AF; font-size: 12px;">This is an automated email, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// Sends an email via Gmail SMTP
const sendEmail = async (to, subject, text, html) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    text,
    html,
  });
  console.log(`Email sent to ${to}: ${subject}`);
};

// Sends a 6-digit verification code for email confirmation during signup
export const sendVerificationEmail = async (name, email, code) => {
  const text = `Hi ${name},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, you can safely ignore this email.\n\n— EduVista`;
  const html = wrap("Verify Your Email", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">Use the verification code below to complete your registration:</p>
    <div style="text-align: center; margin: 0 0 28px 0;">
      <div style="display: inline-block; background-color: #EFF6FF; border: 2px solid #2563EB; border-radius: 12px; padding: 20px 44px;">
        <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #1E3A8A; font-family: 'Courier New', monospace;">${code}</span>
      </div>
    </div>
    <p style="color: #6B7280; font-size: 13px; line-height: 1.6; margin: 0;">This code expires in <strong>10 minutes</strong>. If you didn't create an account, you can safely ignore this email.</p>
  `);
  await sendEmail(email, "Your EduVista Verification Code", text, html);
};

// Sends a welcome email after successful email verification (fire-and-forget)
export const sendWelcomeEmail = (name, email) => {
  const text = `Hi ${name},\n\nWelcome to EduVista! Your account has been created successfully.\n\nYou can now browse courses, enroll, and start learning.\n\n— EduVista`;
  const html = wrap("Welcome to EduVista!", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Welcome to EduVista! Your account has been created successfully. You can now explore thousands of courses and start learning today.</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">Here's what you can do next:</p>
    <ul style="color: #374151; font-size: 15px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
      <li>Browse our course catalog</li>
      <li>Enroll in your first course</li>
      <li>Complete your profile</li>
    </ul>
  `);
  sendEmail(email, "Welcome to EduVista!", text, html).catch((err) => console.error("Welcome email failed:", err.message));
};

// Sends an enrollment confirmation email to the student (fire-and-forget)
export const sendEnrollmentEmail = (name, email, courseTitle) => {
  const text = `Hi ${name},\n\nYou have been successfully enrolled in: ${courseTitle}\n\nStart learning now from your dashboard.\n\n— EduVista`;
  const html = wrap("Enrollment Confirmed!", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">You have been successfully enrolled in:</p>
    <div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; padding: 16px 20px; border-radius: 4px; margin: 0 0 24px 0;">
      <p style="margin: 0; color: #1E3A8A; font-size: 16px; font-weight: 600;">${courseTitle}</p>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Start learning now and track your progress from your dashboard.</p>
  `);
  sendEmail(email, `Enrolled: ${courseTitle}`, text, html).catch((err) => console.error("Enrollment email failed:", err.message));
};

// Sends a certificate issued notification email (fire-and-forget)
export const sendCertificateEmail = (name, email, courseTitle, certificateId) => {
  const text = `Hi ${name},\n\nCongratulations on completing "${courseTitle}"!\n\nYour certificate has been issued.\nCertificate ID: ${certificateId}\n\nYou can download it from the course page.\n\n— EduVista`;
  const html = wrap("Congratulations! Certificate Issued", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Congratulations on completing the course! Your certificate has been issued.</p>
    <div style="background-color: #F0FDF4; border-left: 4px solid #10B981; padding: 16px 20px; border-radius: 4px; margin: 0 0 16px 0;">
      <p style="margin: 0 0 4px 0; color: #065F46; font-size: 16px; font-weight: 600;">${courseTitle}</p>
      <p style="margin: 0; color: #047857; font-size: 13px;">Certificate ID: ${certificateId}</p>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">You can download your certificate from the course page at any time.</p>
  `);
  sendEmail(email, `Certificate: ${courseTitle}`, text, html).catch((err) => console.error("Certificate email failed:", err.message));
};

// Sends a password changed security notification (fire-and-forget)
export const sendPasswordChangedEmail = (name, email) => {
  const text = `Hi ${name},\n\nYour EduVista password was changed successfully.\n\nIf you didn't make this change, please contact support immediately.\n\n— EduVista`;
  const html = wrap("Password Changed", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Your EduVista password was changed successfully.</p>
    <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 4px; margin: 0 0 16px 0;">
      <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 500;">If you didn't make this change, please contact support immediately.</p>
    </div>
  `);
  sendEmail(email, "Your EduVista Password Was Changed", text, html).catch((err) => console.error("Password changed email failed:", err.message));
};

// Sends a course published notification to the instructor (fire-and-forget)
export const sendCoursePublishedEmail = (name, email, courseTitle) => {
  const text = `Hi ${name},\n\nYour course "${courseTitle}" is now published and live on EduVista!\n\nStudents can now discover and enroll in your course.\n\n— EduVista`;
  const html = wrap("Course Published!", `
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hi <strong>${name}</strong>,</p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">Your course is now published and live on EduVista!</p>
    <div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; padding: 16px 20px; border-radius: 4px; margin: 0 0 24px 0;">
      <p style="margin: 0; color: #1E3A8A; font-size: 16px; font-weight: 600;">${courseTitle}</p>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0;">Students can now discover and enroll in your course. Good luck!</p>
  `);
  sendEmail(email, `Published: ${courseTitle}`, text, html).catch((err) => console.error("Course published email failed:", err.message));
};
