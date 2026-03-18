import multer from "multer";

// Stores uploaded files in memory as Buffer
const storage = multer.memoryStorage();

// Allows only image files, rejects non-image uploads
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// Multer instance with memory storage, image filter, and 5MB limit
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});

export default upload;
