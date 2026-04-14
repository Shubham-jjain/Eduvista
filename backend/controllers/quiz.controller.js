import Course from "../models/course.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

// Returns quiz questions for a section without correct answers
export const getQuiz = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, sectionId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isEnrolled = course.studentsEnrolled.some(id => id.toString() === userId);
        const isOwner = course.instructor.toString() === userId;
        const isAdmin = req.user.role === "admin";
        if (!isEnrolled && !isOwner && !isAdmin) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        const section = course.sections.id(sectionId);
        if (!section || !section.quiz || section.quiz.questions.length === 0) {
            return res.status(404).json({ message: "Quiz not found for this section" });
        }

        // Strip correctAnswer from questions before sending to client
        const questions = section.quiz.questions.map((q, index) => ({
            index,
            question: q.question,
            options: q.options,
        }));

        res.status(200).json({
            quiz: {
                questions,
                passPercentage: section.quiz.passPercentage,
                totalQuestions: section.quiz.questions.length,
                sectionTitle: section.title,
            },
        });
    } catch (error) {
        console.error("Get quiz error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Grades quiz answers and upserts the attempt record
export const submitQuiz = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, sectionId, answers } = req.body;

        if (!courseId || !sectionId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "courseId, sectionId, and answers are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (!course.studentsEnrolled.some(id => id.toString() === userId)) {
            return res.status(403).json({ message: "Not enrolled in this course" });
        }

        const section = course.sections.id(sectionId);
        if (!section || !section.quiz || section.quiz.questions.length === 0) {
            return res.status(404).json({ message: "Quiz not found for this section" });
        }

        const quiz = section.quiz;
        const totalQuestions = quiz.questions.length;

        // Grade each answer
        const gradedAnswers = answers.map((ans) => {
            const correctAnswer = quiz.questions[ans.questionIndex]?.correctAnswer;
            return {
                questionIndex: ans.questionIndex,
                selectedAnswer: ans.selectedAnswer,
                isCorrect: ans.selectedAnswer === correctAnswer,
            };
        });

        const score = gradedAnswers.filter((a) => a.isCorrect).length;
        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= quiz.passPercentage;

        // Upsert — one record per student per section (latest score only)
        const attempt = await QuizAttempt.findOneAndUpdate(
            { user: userId, course: courseId, sectionId },
            {
                $set: {
                    answers: gradedAnswers,
                    score,
                    totalQuestions,
                    percentage,
                    passed,
                },
            },
            { upsert: true, new: true }
        );

        // Include correct answers in response so frontend can show results
        const resultsWithCorrect = gradedAnswers.map((ans) => ({
            ...ans,
            correctAnswer: quiz.questions[ans.questionIndex]?.correctAnswer,
        }));

        res.status(200).json({
            attempt: {
                score,
                totalQuestions,
                percentage,
                passed,
                answers: resultsWithCorrect,
            },
        });
    } catch (error) {
        console.error("Submit quiz error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns a student's previous quiz attempt for a section
export const getQuizAttempt = async (req, res) => {
    try {
        const { userId } = req.user;
        const { courseId, sectionId } = req.params;

        const attempt = await QuizAttempt.findOne({ user: userId, course: courseId, sectionId });

        res.status(200).json({ attempt });
    } catch (error) {
        console.error("Get quiz attempt error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
