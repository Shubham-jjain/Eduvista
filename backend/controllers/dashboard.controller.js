import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Progress from "../models/progress.model.js";
import Review from "../models/review.model.js";
import Certificate from "../models/certificate.model.js";
import Payment from "../models/payment.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

// ==================== STUDENT CONTROLLERS ====================

// Returns aggregate stats for student dashboard cards
export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [enrolledCount, completedCount, certificatesCount, quizAttempts] =
      await Promise.all([
        Progress.countDocuments({ user: userId }),
        Progress.countDocuments({ user: userId, completed: true }),
        Certificate.countDocuments({ user: userId }),
        QuizAttempt.find({ user: userId }),
      ]);

    const avgQuizScore =
      quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((sum, q) => sum + q.percentage, 0) /
              quizAttempts.length
          )
        : 0;

    res.json({ enrolledCount, completedCount, certificatesCount, avgQuizScore });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns the most recently accessed incomplete course for resume learning
export const getContinueLearning = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.userId,
      completed: false,
    })
      .sort({ updatedAt: -1 })
      .populate("course", "title thumbnail");

    if (!progress) return res.json(null);

    res.json({
      course: progress.course,
      progressPercentage: progress.progressPercentage,
      lastAccessedLesson: progress.lastAccessedLesson,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns the student's 5 most recent quiz attempts
export const getRecentQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizAttempt.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("course", "title");

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns all enrolled courses with progress data for the student
export const getStudentCourses = async (req, res) => {
  try {
    const progressList = await Progress.find({
      user: req.user.userId,
      completed: false,
    })
      .sort({ updatedAt: -1 })
      .populate("course", "title thumbnail category");

    res.json(progressList);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== INSTRUCTOR CONTROLLERS ====================

// Returns aggregate stats for instructor dashboard cards
export const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.userId;

    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, c) => sum + (c.studentsEnrolled?.length || 0),
      0
    );

    const avgRating =
      courses.length > 0
        ? (
            courses.reduce((sum, c) => sum + (c.rating?.average || 0), 0) /
            courses.length
          ).toFixed(1)
        : "0.0";

    const revenueResult = await Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({ totalCourses, totalStudents, avgRating, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns per-course performance metrics for the instructor
export const getCoursePerformance = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.userId });

    const performance = await Promise.all(
      courses.map(async (course) => {
        const enrolled = course.studentsEnrolled?.length || 0;
        const completedCount = await Progress.countDocuments({
          course: course._id,
          completed: true,
        });
        const completionRate =
          enrolled > 0 ? Math.round((completedCount / enrolled) * 100) : 0;

        const revenueResult = await Payment.aggregate([
          { $match: { course: course._id, status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        return {
          courseId: course._id,
          title: course.title,
          enrolled,
          avgRating: course.rating?.average || 0,
          ratingCount: course.rating?.count || 0,
          completionRate,
          revenue: revenueResult[0]?.total || 0,
          status: course.status,
        };
      })
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns the 10 most recent reviews across the instructor's courses
export const getInstructorRecentReviews = async (req, res) => {
  try {
    const courseIds = await Course.find({
      instructor: req.user.userId,
    }).distinct("_id");

    const reviews = await Review.find({ course: { $in: courseIds } })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name profileImage")
      .populate("course", "title");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns the 10 most recent enrollments across the instructor's courses
export const getInstructorRecentEnrollments = async (req, res) => {
  try {
    const courseIds = await Course.find({
      instructor: req.user.userId,
    }).distinct("_id");

    const enrollments = await Payment.find({
      course: { $in: courseIds },
      status: "success",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name profileImage")
      .populate("course", "title");

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== ADMIN CONTROLLERS ====================

// Returns platform-wide aggregate stats for admin dashboard cards
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, revenueResult] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Progress.countDocuments(),
        Payment.aggregate([
          { $match: { status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: revenueResult[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns user count grouped by role for the pie chart
export const getUserBreakdown = async (req, res) => {
  try {
    const breakdown = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const result = { students: 0, instructors: 0, admins: 0 };
    breakdown.forEach((b) => {
      if (b._id === "student") result.students = b.count;
      if (b._id === "instructor") result.instructors = b.count;
      if (b._id === "admin") result.admins = b.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns paginated user list with optional role filter and search
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) query.name = { $regex: search, $options: "i" };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Toggles a user's isActive status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Changes a user's role to the specified value
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns paginated course list with instructor info for admin management
export const getAdminCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) query.title = { $regex: search, $options: "i" };

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("instructor", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Course.countDocuments(query),
    ]);

    res.json({
      courses,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Deletes a course and all related data (progress, reviews, certificates, payments, quiz attempts)
export const deleteAdminCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Promise.all([
      Progress.deleteMany({ course: req.params.id }),
      Review.deleteMany({ course: req.params.id }),
      Certificate.deleteMany({ course: req.params.id }),
      Payment.deleteMany({ course: req.params.id }),
      QuizAttempt.deleteMany({ course: req.params.id }),
      User.updateMany(
        { enrolledCourses: req.params.id },
        { $pull: { enrolledCourses: req.params.id } }
      ),
    ]);

    res.json({ message: "Course and related data deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns top 5 courses by rating and top 5 by enrollment count
export const getTopCourses = async (req, res) => {
  try {
    const [topRated, topEnrolled] = await Promise.all([
      Course.find({ status: "published" })
        .sort({ "rating.average": -1 })
        .limit(5)
        .select("title rating studentsEnrolled thumbnail")
        .populate("instructor", "name"),
      Course.find({ status: "published" })
        .sort({ "studentsEnrolled.length": -1 })
        .limit(5)
        .select("title rating studentsEnrolled thumbnail")
        .populate("instructor", "name"),
    ]);

    res.json({ topRated, topEnrolled });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Returns recent platform activity (registrations, enrollments, reviews)
export const getRecentActivity = async (req, res) => {
  try {
    const [recentUsers, recentEnrollments, recentReviews] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select("name role createdAt"),
      Payment.find({ status: "success" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name")
        .populate("course", "title"),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name")
        .populate("course", "title"),
    ]);

    const activity = [
      ...recentUsers.map((u) => ({
        type: "registration",
        message: `${u.name} joined as ${u.role}`,
        timestamp: u.createdAt,
      })),
      ...recentEnrollments.map((e) => ({
        type: "enrollment",
        message: `${e.user?.name} enrolled in ${e.course?.title}`,
        timestamp: e.createdAt,
      })),
      ...recentReviews.map((r) => ({
        type: "review",
        message: `${r.user?.name} reviewed ${r.course?.title}`,
        timestamp: r.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
