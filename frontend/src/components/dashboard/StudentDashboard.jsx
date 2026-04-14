import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Award, CheckCircle, Brain, Play } from "lucide-react";
import API from "../../api/axios";
import StatCard from "./StatCard";

// Student dashboard showing stats, continue learning, courses, and quiz results
const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [continueLearning, setContinueLearning] = useState(null);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches all student dashboard data on mount
  const fetchDashboardData = async () => {
    try {
      const [statsRes, continueRes, coursesRes, quizzesRes] = await Promise.all([
        API.get("/dashboard/student/stats"),
        API.get("/dashboard/student/continue-learning"),
        API.get("/dashboard/student/courses"),
        API.get("/dashboard/student/recent-quizzes"),
      ]);
      setStats(statsRes.data);
      setContinueLearning(continueRes.data);
      setCourses(coursesRes.data);
      setQuizzes(quizzesRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#111827]">Student Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Enrolled Courses"
          value={stats?.enrolledCount || 0}
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          title="Completed"
          value={stats?.completedCount || 0}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          title="Certificates"
          value={stats?.certificatesCount || 0}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          icon={<Brain className="w-6 h-6" />}
          title="Avg Quiz Score"
          value={`${stats?.avgQuizScore || 0}%`}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
      </div>

      {/* Continue Learning */}
      {continueLearning && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Continue Learning</h2>
          <div className="flex items-center gap-4">
            <img
              src={continueLearning.course?.thumbnail || "/placeholder.png"}
              alt={continueLearning.course?.title}
              className="w-24 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-[#111827]">{continueLearning.course?.title}</h3>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#2563EB] h-2 rounded-full"
                  style={{ width: `${continueLearning.progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-[#6B7280] mt-1">{continueLearning.progressPercentage}% complete</p>
            </div>
            <Link
              to={`/courses/${continueLearning.course?._id}`}
              className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg hover:bg-[#1E3A8A] transition-colors text-sm font-medium"
            >
              <Play className="w-4 h-4" />
              Resume
            </Link>
          </div>
        </div>
      )}

      {/* Two Column: In-Progress Courses & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* In-Progress Courses */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">In-Progress Courses</h2>
          {courses.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No courses in progress.</p>
          ) : (
            <div className="space-y-4">
              {courses.map((item) => (
                <Link
                  key={item._id}
                  to={`/courses/${item.course?._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#DBEAFE] transition-colors"
                >
                  <img
                    src={item.course?.thumbnail || "/placeholder.png"}
                    alt={item.course?.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] text-sm truncate">{item.course?.title}</p>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-[#2563EB] h-1.5 rounded-full"
                        style={{ width: `${item.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-[#6B7280] font-medium">{item.progressPercentage}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Results */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Quiz Results</h2>
          {quizzes.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No quiz attempts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#6B7280] border-b border-[#E5E7EB]">
                    <th className="pb-3 font-medium">Course</th>
                    <th className="pb-3 font-medium">Score</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz._id} className="border-b border-[#E5E7EB] last:border-0">
                      <td className="py-3 text-[#111827] max-w-37.5 truncate">{quiz.course?.title}</td>
                      <td className="py-3 text-[#111827]">{quiz.percentage}%</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.passed
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {quiz.passed ? "Passed" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
