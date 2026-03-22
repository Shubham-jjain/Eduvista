import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";

// Returns all published courses with optional category and search filters
export const getAllCourses = async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = { status: "published" };

        if (category) filter.category = category;
        if (search) filter.title = { $regex: search, $options: "i" };

        const courses = await Course.find(filter)
            .populate("instructor", "name profileImage")
            .select("-sections")
            .sort({ createdAt: -1 });

        res.status(200).json({ courses });
    } catch (error) {
        console.error("Get all courses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns courses based on role: enrolled (student), created (instructor), or all (admin)
export const getMyCourses = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let courses;

        if (role === "student") {
            courses = await Course.find({ studentsEnrolled: userId })
                .populate("instructor", "name profileImage")
                .select("-sections");
        } else if (role === "instructor") {
            courses = await Course.find({ instructor: userId })
                .select("-sections");
        } else if (role === "admin") {
            courses = await Course.find()
                .populate("instructor", "name profileImage")
                .select("-sections");
        }

        res.status(200).json({ courses });
    } catch (error) {
        console.error("Get my courses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns a single course by ID with full details including sections and instructor info
export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name profileImage bio expertise");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ course });
    } catch (error) {
        console.error("Get course by id error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates an existing course (only the owning instructor can edit)
export const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to update this course" });
        }

        const { title, description, category, price, status, sections } = req.body;

        let thumbnail = course.thumbnail;
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "eduvista/courses",
                width: 800,
                height: 450,
                crop: "fill",
            });
            thumbnail = result.secure_url;
        }

        const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections || course.sections;

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.price = price !== undefined ? Number(price) : course.price;
        course.status = status || course.status;
        course.thumbnail = thumbnail;
        course.sections = parsedSections;

        await course.save();

        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error("Update course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Deletes a course (owner instructor or admin only) and cleans up enrolled references
export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isOwner = course.instructor.toString() === req.user.userId;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }

        await User.updateMany(
            { enrolledCourses: course._id },
            { $pull: { enrolledCourses: course._id } }
        );

        await course.deleteOne();

        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Delete course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Creates a new course with optional thumbnail upload to Cloudinary
export const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, status, sections } = req.body;

        let thumbnail = "";
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: "eduvista/courses",
                width: 800,
                height: 450,
                crop: "fill",
            });
            thumbnail = result.secure_url;
        }

        const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections || [];

        const course = await Course.create({
            title,
            description,
            category,
            price: Number(price),
            thumbnail,
            instructor: req.user.userId,
            sections: parsedSections,
            status: status || "draft",
        });

        res.status(201).json({ message: "Course created successfully", course });
    } catch (error) {
        console.error("Create course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
