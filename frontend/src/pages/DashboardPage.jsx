import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import StudentDashboard from "../components/dashboard/StudentDashboard";
import InstructorDashboard from "../components/dashboard/InstructorDashboard";
import AdminDashboard from "../components/dashboard/AdminDashboard";

// Renders the appropriate role-based dashboard for the logged-in user
const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {user?.role === "student" && <StudentDashboard />}
        {user?.role === "instructor" && <InstructorDashboard />}
        {user?.role === "admin" && <AdminDashboard />}
        {!user && (
          <p className="text-[#6B7280] text-center py-20">Please log in to view your dashboard.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
