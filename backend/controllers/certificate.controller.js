import PDFDocument from "pdfkit";
import Certificate from "../models/certificate.model.js";
import Progress from "../models/progress.model.js";
import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import generateCertificatePDF from "../services/certificateService.js";

// Generates and downloads a PDF certificate for a completed course
export const generateCertificate = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId } = req.params;

        // Check progress — must be at least 95%
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress || progress.progressPercentage < 95) {
            return res.status(400).json({
                message: "Complete at least 95% of the course to get your certificate",
            });
        }

        // Check if certificate already exists
        let certificate = await Certificate.findOne({ user: userId, course: courseId });

        if (!certificate) {
            const year = new Date().getFullYear();
            const certificateId = `CERT-${year}-${userId.toString().slice(-6)}-${courseId.toString().slice(-6)}`;

            certificate = await Certificate.create({
                user: userId,
                course: courseId,
                certificateId,
                issuedAt: new Date(),
            });
        }

        // Fetch user and course details for the PDF
        const user = await User.findById(userId).select("name");
        const course = await Course.findById(courseId).select("title");

        if (!user || !course) {
            return res.status(404).json({ message: "User or course not found" });
        }

        // Generate PDF and stream to response
        const doc = new PDFDocument({ size: "A4", layout: "landscape" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=certificate-${certificate.certificateId}.pdf`);

        doc.pipe(res);

        generateCertificatePDF(doc, {
            studentName: user.name,
            courseTitle: course.title,
            certificateId: certificate.certificateId,
            issuedAt: certificate.issuedAt,
        });

        doc.end();
    } catch (error) {
        console.error("Generate certificate error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
