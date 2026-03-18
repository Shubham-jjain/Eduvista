import Course from "../models/course.model.js";

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
