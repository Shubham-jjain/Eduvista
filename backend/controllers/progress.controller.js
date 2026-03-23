import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";

// Marks a lesson as complete and recalculates progress percentage
export const markLessonComplete = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, lessonId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (!course.studentsEnrolled.includes(userId)) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        const allLessons = course.sections.flatMap((section) => section.lessons);
        const lessonExists = allLessons.some((lesson) => lesson._id.toString() === lessonId);
        if (!lessonExists) {
            return res.status(404).json({ message: "Lesson not found in this course" });
        }

        const totalLessons = allLessons.length;

        const progress = await Progress.findOneAndUpdate(
            { user: userId, course: courseId },
            { $addToSet: { completedLessons: lessonId } },
            { new: true, upsert: true }
        );

        const completedCount = progress.completedLessons.length;
        progress.progressPercentage = Math.round((completedCount / totalLessons) * 100);
        progress.completed = progress.progressPercentage === 100;
        await progress.save();

        res.status(200).json({ progress });
    } catch (error) {
        console.error("Mark lesson complete error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns progress data for a specific course
export const getProgress = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId } = req.params;

        const progress = await Progress.findOne({ user: userId, course: courseId });

        if (!progress) {
            return res.status(200).json({
                progress: {
                    progressPercentage: 0,
                    completed: false,
                    completedLessons: [],
                    lastAccessedLesson: null,
                },
            });
        }

        res.status(200).json({ progress });
    } catch (error) {
        console.error("Get progress error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates the last accessed lesson for resume functionality
export const updateLastAccessed = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, lessonId } = req.body;

        const progress = await Progress.findOneAndUpdate(
            { user: userId, course: courseId },
            { lastAccessedLesson: lessonId },
            { new: true, upsert: true }
        );

        res.status(200).json({ progress });
    } catch (error) {
        console.error("Update last accessed error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
