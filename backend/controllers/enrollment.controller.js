import Course from "../models/course.model.js";
import User from "../models/user.model.js";
import Progress from "../models/progress.model.js";
import Payment from "../models/payment.model.js";
import { sendEnrollmentEmail } from "../services/emailService.js";

// Enrolls a student in a published course with mock payment
export const enrollInCourse = async (req, res) => {
    try {
        const { userId } = req.user;
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.status !== "published") {
            return res.status(400).json({ message: "Cannot enroll in a draft course" });
        }

        if (course.studentsEnrolled.includes(userId)) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        const transactionId = Date.now().toString(36);

        course.studentsEnrolled.push(userId);
        await course.save();

        await User.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: course._id },
        });

        await Progress.create({
            user: userId,
            course: course._id,
        });

        // Create payment record for paid courses
        if (course.price > 0) {
            await Payment.create({
                user: userId,
                course: course._id,
                amount: course.price,
                status: "success",
                transactionId,
            });
        }

        const student = await User.findById(userId).select("name email");
        if (student) sendEnrollmentEmail(student.name, student.email, course.title);

        res.status(200).json({ message: "Enrolled successfully", transactionId });
    } catch (error) {
        console.error("Enroll in course error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns all courses the student is enrolled in with progress data
export const getEnrolledCourses = async (req, res) => {
    try {
        const { userId } = req.user;

        const courses = await Course.find({ studentsEnrolled: userId })
            .populate("instructor", "name profileImage")
            .select("-sections");

        const coursesWithProgress = await Promise.all(
            courses.map(async (course) => {
                const progress = await Progress.findOne({
                    user: userId,
                    course: course._id,
                });
                return {
                    ...course.toObject(),
                    progress: progress
                        ? {
                              progressPercentage: progress.progressPercentage,
                              completed: progress.completed,
                              completedLessons: progress.completedLessons,
                              lastAccessedLesson: progress.lastAccessedLesson,
                          }
                        : { progressPercentage: 0, completed: false, completedLessons: [], lastAccessedLesson: null },
                };
            })
        );

        res.status(200).json({ courses: coursesWithProgress });
    } catch (error) {
        console.error("Get enrolled courses error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
