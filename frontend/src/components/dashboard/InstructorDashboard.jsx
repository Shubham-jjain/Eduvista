import { useState, useEffect } from "react";
import { BookOpen, Users, Star, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import API from "../../api/axios";
import StatCard from "./StatCard";

// Instructor dashboard showing stats, course performance, reviews, and rating chart
const InstructorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches all instructor dashboard data on mount
  const fetchDashboardData = async () => {
    try {
      const [statsRes, perfRes, reviewsRes, enrollRes] = await Promise.all([
        API.get("/dashboard/instructor/stats"),
        API.get("/dashboard/instructor/course-performance"),
        API.get("/dashboard/instructor/recent-reviews"),
        API.get("/dashboard/instructor/recent-enrollments"),
      ]);
      setStats(statsRes.data);
      setPerformance(perfRes.data);
      setReviews(reviewsRes.data);
      setEnrollments(enrollRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Builds rating distribution data from reviews for the bar chart
  const getRatingDistribution = () => {
    const dist = [1, 2, 3, 4, 5].map((star) => ({
      stars: `${star}★`,
      count: reviews.filter((r) => r.rating === star).length,
    }));
    return dist;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#111827]">Instructor Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Total Courses"
          value={stats?.totalCourses || 0}
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Students"
          value={stats?.totalStudents || 0}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          title="Avg Rating"
          value={stats?.avgRating || "0.0"}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Course Performance</h2>
        {performance.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No courses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B7280] border-b border-[#E5E7EB]">
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Enrolled</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Completion</th>
                  <th className="pb-3 font-medium">Revenue</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((course) => (
                  <tr key={course.courseId} className="border-b border-[#E5E7EB] last:border-0">
                    <td className="py-3 text-[#111827] font-medium max-w-50 truncate">
                      {course.title}
                    </td>
                    <td className="py-3 text-[#111827]">{course.enrolled}</td>
                    <td className="py-3 text-[#111827]">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {course.avgRating.toFixed(1)} ({course.ratingCount})
                      </span>
                    </td>
                    <td className="py-3 text-[#111827]">{course.completionRate}%</td>
                    <td className="py-3 text-[#111827]">${course.revenue}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === "published"
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-100 text-[#6B7280]"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column: Recent Reviews & Rating Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="flex gap-3 pb-4 border-b border-[#E5E7EB] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                    {review.user?.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt={review.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-[#1E3A8A]">
                        {review.user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#111827]">{review.user?.name}</p>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#6B7280] mt-0.5">{review.course?.title}</p>
                    <p className="text-sm text-[#111827] mt-1 line-clamp-2">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Rating Distribution</h2>
          {reviews.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No ratings data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getRatingDistribution()}>
                <XAxis dataKey="stars" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Enrollments</h2>
        {enrollments.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No enrollments yet.</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="flex items-center justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                    <span className="text-xs font-medium text-[#1E3A8A]">
                      {enrollment.user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{enrollment.user?.name}</p>
                    <p className="text-xs text-[#6B7280]">{enrollment.course?.title}</p>
                  </div>
                </div>
                <span className="text-xs text-[#6B7280]">
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
