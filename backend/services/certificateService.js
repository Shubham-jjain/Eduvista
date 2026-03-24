// Writes a professional certificate of completion PDF to a PDFKit document
const generateCertificatePDF = (doc, { studentName, courseTitle, certificateId, issuedAt }) => {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;

    // Border
    doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2)
        .lineWidth(2)
        .stroke("#1E3A8A");

    // Inner border
    doc.rect(margin + 8, margin + 8, pageWidth - (margin + 8) * 2, pageHeight - (margin + 8) * 2)
        .lineWidth(0.5)
        .stroke("#2563EB");

    // Header
    doc.fontSize(14)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text("EduVista", 0, margin + 40, { align: "center" });

    // Title
    doc.fontSize(32)
        .font("Helvetica-Bold")
        .fillColor("#1E3A8A")
        .text("Certificate of Completion", 0, margin + 80, { align: "center" });

    // Decorative line
    const lineY = margin + 130;
    doc.moveTo(pageWidth / 2 - 100, lineY)
        .lineTo(pageWidth / 2 + 100, lineY)
        .lineWidth(1)
        .stroke("#2563EB");

    // Presented to
    doc.fontSize(12)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text("This certificate is proudly presented to", 0, margin + 155, { align: "center" });

    // Student name
    doc.fontSize(28)
        .font("Helvetica-Bold")
        .fillColor("#111827")
        .text(studentName, 0, margin + 185, { align: "center" });

    // For completing
    doc.fontSize(12)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text("for successfully completing the course", 0, margin + 235, { align: "center" });

    // Course title
    doc.fontSize(20)
        .font("Helvetica-Bold")
        .fillColor("#2563EB")
        .text(courseTitle, margin + 40, margin + 265, { align: "center", width: pageWidth - (margin + 40) * 2 });

    // Date
    const formattedDate = new Date(issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    doc.fontSize(11)
        .font("Helvetica")
        .fillColor("#6B7280")
        .text(`Issued on ${formattedDate}`, 0, margin + 340, { align: "center" });

    // Certificate ID
    doc.fontSize(9)
        .font("Helvetica")
        .fillColor("#9CA3AF")
        .text(`Certificate ID: ${certificateId}`, 0, pageHeight - margin - 40, { align: "center" });
};

export default generateCertificatePDF;
