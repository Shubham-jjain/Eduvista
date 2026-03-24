import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  DollarSign,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import API from "../../api/axios";
import StatCard from "./StatCard";

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B"];

// Admin dashboard with platform stats, charts, user/course management, and activity feed
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [users, setUsers] = useState([]);
  const [userPages, setUserPages] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [courses, setCourses] = useState([]);
  const [coursePages, setCoursePages] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearch, setCourseSearch] = useState("");
  const [topCourses, setTopCourses] = useState({ topRated: [], topEnrolled: [] });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches initial dashboard data on mount
  const fetchInitialData = async () => {
    try {
      const [statsRes, breakdownRes, topRes, activityRes] = await Promise.all([
        API.get("/dashboard/admin/stats"),
        API.get("/dashboard/admin/user-breakdown"),
        API.get("/dashboard/admin/top-courses"),
        API.get("/dashboard/admin/recent-activity"),
      ]);
      setStats(statsRes.data);
      setBreakdown(breakdownRes.data);
      setTopCourses(topRes.data);
      setActivity(activityRes.data);
    } catch (error) {
      console.error("Failed to fetch admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetches paginated user list with optional filters
  const fetchUsers = async () => {
    try {
      const params = { page: userPage, limit: 10 };
      if (userSearch) params.search = userSearch;
      if (userRoleFilter) params.role = userRoleFilter;
      const res = await API.get("/dashboard/admin/users", { params });
      setUsers(res.data.users);
      setUserPages(res.data.pages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Fetches paginated course list with optional search
  const fetchCourses = async () => {
    try {
      const params = { page: coursePage, limit: 10 };
      if (courseSearch) params.search = courseSearch;
      const res = await API.get("/dashboard/admin/courses", { params });
      setCourses(res.data.courses);
      setCoursePages(res.data.pages);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [userPage, userSearch, userRoleFilter]);

  useEffect(() => {
    fetchCourses();
  }, [coursePage, courseSearch]);

  // Toggles a user's active/inactive status
  const handleToggleStatus = async (userId) => {
    try {
      await API.put(`/dashboard/admin/users/${userId}/status`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  // Changes a user's role to the selected value
  const handleChangeRole = async (userId, role) => {
    try {
      await API.put(`/dashboard/admin/users/${userId}/role`, { role });
      fetchUsers();
      const breakdownRes = await API.get("/dashboard/admin/user-breakdown");
      setBreakdown(breakdownRes.data);
    } catch (error) {
      console.error("Failed to change role:", error);
    }
  };

  // Deletes a course and refreshes the course list and stats
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This will also remove all related data.")) return;
    try {
      await API.delete(`/dashboard/admin/courses/${courseId}`);
      fetchCourses();
      const statsRes = await API.get("/dashboard/admin/stats");
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  // Builds pie chart data from the user role breakdown
  const getPieData = () => {
    if (!breakdown) return [];
    return [
      { name: "Students", value: breakdown.students },
      { name: "Instructors", value: breakdown.instructors },
      { name: "Admins", value: breakdown.admins },
    ];
  };

  // Builds bar chart data from top enrolled courses
  const getBarData = () => {
    return topCourses.topEnrolled.map((c) => ({
      name: c.title?.length > 15 ? c.title.slice(0, 15) + "..." : c.title,
      enrolled: c.studentsEnrolled?.length || 0,
    }));
  };

  // Returns an icon and color based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "registration":
        return <Users className="w-4 h-4 text-[#2563EB]" />;
      case "enrollment":
        return <GraduationCap className="w-4 h-4 text-green-600" />;
      case "review":
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-[#6B7280]" />;
    }
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
      <h1 className="text-2xl font-bold text-[#111827]">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Total Users"
          value={stats?.totalUsers || 0}
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Total Courses"
          value={stats?.totalCourses || 0}
          bgColor="bg-green-50"
          textColor="text-green-600"
        />
        <StatCard
          icon={<GraduationCap className="w-6 h-6" />}
          title="Total Enrollments"
          value={stats?.totalEnrollments || 0}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          title="Total Revenue"
          value={`$${stats?.totalRevenue || 0}`}
          bgColor="bg-amber-50"
          textColor="text-amber-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown Pie Chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">User Breakdown</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={getPieData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {getPieData().map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses Bar Chart */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-4">Top Courses by Enrollment</h2>
          {getBarData().length === 0 ? (
            <p className="text-[#6B7280] text-sm">No course data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={getBarData()}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip />
                <Bar dataKey="enrolled" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#111827]">User Management</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                className="pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUserPage(1);
              }}
              className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6B7280] border-b border-[#E5E7EB]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-[#E5E7EB] last:border-0">
                  <td className="py-3 text-[#111827] font-medium">{user.name}</td>
                  <td className="py-3 text-[#6B7280]">{user.email}</td>
                  <td className="py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      className="px-2 py-1 border border-[#E5E7EB] rounded text-xs focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      title={user.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.isActive ? (
                        <UserX className="w-4 h-4 text-red-500" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {userPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setUserPage((p) => Math.max(1, p - 1))}
              disabled={userPage === 1}
              className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-sm text-[#6B7280]">
              Page {userPage} of {userPages}
            </span>
            <button
              onClick={() => setUserPage((p) => Math.min(userPages, p + 1))}
              disabled={userPage === userPages}
              className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Course Management */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-[#111827]">Course Management</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => {
                setCourseSearch(e.target.value);
                setCoursePage(1);
              }}
              className="pl-9 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#6B7280] border-b border-[#E5E7EB]">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Instructor</th>
                <th className="pb-3 font-medium">Enrolled</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-[#E5E7EB] last:border-0">
                  <td className="py-3 text-[#111827] font-medium max-w-[200px] truncate">
                    {course.title}
                  </td>
                  <td className="py-3 text-[#6B7280]">{course.instructor?.name}</td>
                  <td className="py-3 text-[#111827]">{course.studentsEnrolled?.length || 0}</td>
                  <td className="py-3 text-[#111827]">
                    {course.rating?.average?.toFixed(1) || "0.0"}
                  </td>
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
                  <td className="py-3">
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete course"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {coursePages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
              disabled={coursePage === 1}
              className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              Prev
            </button>
            <span className="text-sm text-[#6B7280]">
              Page {coursePage} of {coursePages}
            </span>
            <button
              onClick={() => setCoursePage((p) => Math.min(coursePages, p + 1))}
              disabled={coursePage === coursePages}
              className="px-3 py-1 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50 hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-[#6B7280] text-sm">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {activity.map((item, index) => (
              <div key={index} className="flex items-center gap-3 py-2 border-b border-[#E5E7EB] last:border-0">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[#111827]">{item.message}</p>
                </div>
                <span className="text-xs text-[#6B7280] whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
