import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import Navbar from "../components/Navbar";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import InstructorDashboard from "../components/dashboard/InstructorDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

// Renders the appropriate role-based dashboard for the logged-in user
const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {user && (
          <div className="mb-8">
            <h1 className="animate-fade-in-up font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-2" style={{ animationDelay: '100ms' }}>
              Welcome back, {user.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="animate-fade-in-up text-[#6B7280]" style={{ animationDelay: '200ms' }}>
              {user.role === 'student' && 'Continue your learning journey'}
              {user.role === 'instructor' && 'Manage your courses and track student progress'}
              {user.role === 'admin' && 'Monitor platform activity and manage users'}
            </p>
          </div>
        )}
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {user?.role === "student" && <StudentDashboard />}
          {user?.role === "instructor" && <InstructorDashboard />}
          {user?.role === "admin" && <AdminDashboard />}
        </div>
        {!user && (
          <div className="text-center py-20 animate-fade-in">
            <BookOpen className="w-16 h-16 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#111827] mb-1">Access your dashboard</p>
            <p className="text-sm text-[#6B7280] mb-6">Please log in to view your personalized dashboard</p>
            <Link to="/login" className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98]">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
