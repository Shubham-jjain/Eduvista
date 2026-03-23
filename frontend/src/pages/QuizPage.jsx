import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, ArrowLeft, FileText } from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";

// Quiz taking and results page for a course section
const QuizPage = () => {
    const { courseId, sectionId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [previousAttempt, setPreviousAttempt] = useState(null);

    useEffect(() => {
        fetchQuizData();
    }, [courseId, sectionId]);

    // Fetches quiz questions and any previous attempt
    const fetchQuizData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [quizRes, attemptRes] = await Promise.all([
                API.get(`/quiz/${courseId}/${sectionId}`),
                API.get(`/quiz/attempt/${courseId}/${sectionId}`),
            ]);
            setQuiz(quizRes.data.quiz);
            if (attemptRes.data.attempt) {
                setPreviousAttempt(attemptRes.data.attempt);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    // Handles selecting an answer for a question
    const handleSelectAnswer = (questionIndex, optionIndex) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    };

    // Submits quiz answers for grading
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const answers = Object.entries(selectedAnswers).map(([questionIndex, selectedAnswer]) => ({
                questionIndex: Number(questionIndex),
                selectedAnswer,
            }));
            const res = await API.post("/quiz/submit", { courseId, sectionId, answers });
            setResult(res.data.attempt);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit quiz");
        } finally {
            setSubmitting(false);
        }
    };

    // Resets state for retaking the quiz
    const handleRetake = () => {
        setResult(null);
        setSelectedAnswers({});
    };

    const allAnswered = quiz && Object.keys(selectedAnswers).length === quiz.totalQuestions;

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-12">
                    <p className="text-[#6B7280] text-center">{error || "Quiz not found"}</p>
                    <div className="text-center mt-4">
                        <Link to={`/courses/${courseId}`} className="text-[#2563EB] hover:underline text-sm">
                            Back to Course
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Results view after submission
    if (result) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#2563EB] mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Course
                    </Link>

                    {/* Score summary */}
                    <div className={`rounded-lg p-6 mb-8 ${result.passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {result.passed ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            ) : (
                                <XCircle className="w-8 h-8 text-red-500" />
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-[#111827]">
                                    {result.passed ? "Quiz Passed!" : "Quiz Not Passed"}
                                </h2>
                                <p className="text-[#6B7280]">{quiz.sectionTitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 mt-4">
                            <div>
                                <p className="text-sm text-[#6B7280]">Score</p>
                                <p className="text-2xl font-bold text-[#111827]">{result.score}/{result.totalQuestions}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">Percentage</p>
                                <p className="text-2xl font-bold text-[#111827]">{result.percentage}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#6B7280]">Pass Mark</p>
                                <p className="text-2xl font-bold text-[#111827]">{quiz.passPercentage}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Per-question breakdown */}
                    <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4">Question Breakdown</h3>
                    <div className="space-y-4 mb-8">
                        {quiz.questions.map((q, idx) => {
                            const answer = result.answers.find((a) => a.questionIndex === idx);
                            return (
                                <div key={idx} className="border border-[#E5E7EB] rounded-lg p-4">
                                    <div className="flex items-start gap-2 mb-3">
                                        {answer?.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                        )}
                                        <p className="text-sm font-medium text-[#111827]">
                                            {idx + 1}. {q.question}
                                        </p>
                                    </div>
                                    <div className="ml-7 space-y-1.5">
                                        {q.options.map((option, optIdx) => {
                                            const isSelected = answer?.selectedAnswer === optIdx;
                                            const isCorrect = answer?.correctAnswer === optIdx;
                                            let optionStyle = "text-[#6B7280]";
                                            if (isCorrect) optionStyle = "text-green-700 font-medium";
                                            if (isSelected && !answer?.isCorrect) optionStyle = "text-red-600 line-through";
                                            if (isSelected && answer?.isCorrect) optionStyle = "text-green-700 font-medium";

                                            return (
                                                <div key={optIdx} className={`text-sm flex items-center gap-2 ${optionStyle}`}>
                                                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs shrink-0">
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    {option}
                                                    {isCorrect && !isSelected && (
                                                        <span className="text-xs text-green-600 ml-1">(correct)</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <button onClick={handleRetake} className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors">
                            Retake Quiz
                        </button>
                        <Link to={`/courses/${courseId}`} className="border border-[#E5E7EB] text-[#6B7280] px-5 py-2.5 rounded-lg hover:text-[#2563EB] hover:border-[#2563EB] transition-colors">
                            Back to Course
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz-taking view
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-3xl mx-auto px-6 py-8">
                <Link to={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#2563EB] mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Course
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-[#2563EB]" />
                        <h1 className="text-xl font-bold text-[#1E3A8A]">{quiz.sectionTitle} — Quiz</h1>
                    </div>
                    <p className="text-sm text-[#6B7280]">
                        {quiz.totalQuestions} questions · Pass mark: {quiz.passPercentage}%
                    </p>
                </div>

                {/* Previous attempt banner */}
                {previousAttempt && (
                    <div className={`rounded-lg px-4 py-3 mb-6 text-sm ${previousAttempt.passed ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
                        Previous attempt: {previousAttempt.percentage}% ({previousAttempt.score}/{previousAttempt.totalQuestions}) — {previousAttempt.passed ? "Passed" : "Not passed"}
                    </div>
                )}

                {/* Questions */}
                <div className="space-y-6 mb-8">
                    {quiz.questions.map((q) => (
                        <div key={q.index} className="border border-[#E5E7EB] rounded-lg p-5">
                            <p className="text-sm font-medium text-[#111827] mb-3">
                                {q.index + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                                {q.options.map((option, optIdx) => {
                                    const isSelected = selectedAnswers[q.index] === optIdx;
                                    return (
                                        <button
                                            key={optIdx}
                                            onClick={() => handleSelectAnswer(q.index, optIdx)}
                                            className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                                                isSelected
                                                    ? "border-[#2563EB] bg-[#DBEAFE] text-[#2563EB] font-medium"
                                                    : "border-[#E5E7EB] text-[#111827] hover:border-[#2563EB] hover:bg-[#DBEAFE]/50"
                                            }`}
                                        >
                                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 ${
                                                isSelected ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E5E7EB]"
                                            }`}>
                                                {String.fromCharCode(65 + optIdx)}
                                            </span>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                        allAnswered && !submitting
                            ? "bg-[#2563EB] text-white hover:bg-[#1E3A8A]"
                            : "bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed"
                    }`}
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                        </span>
                    ) : (
                        `Submit Quiz (${Object.keys(selectedAnswers).length}/${quiz.totalQuestions} answered)`
                    )}
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
