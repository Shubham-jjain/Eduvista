import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Users, Plus, Loader2, Star, Pencil, Trash2 } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"

// Displays role-based course list: enrolled, created, or all courses
const MyCoursesPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetches user's courses from the backend API
  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses/my-courses")
      setCourses(res.data.courses)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e, courseId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return
    try {
      await API.delete(`/courses/${courseId}`)
      setCourses((prev) => prev.filter((c) => c._id !== courseId))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course")
    }
  }

  const heading = user.role === "admin" ? "All Courses" : "My Courses"

  const emptyMessage =
    user.role === "student"
      ? "You haven't enrolled in any courses yet."
      : user.role === "instructor"
      ? "You haven't created any courses yet."
      : "No courses available."

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#111827]">{heading}</h1>
          {user.role === "instructor" && (
            <Link
              to="/create-course"
              className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Course
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-[#6B7280] mb-4">{emptyMessage}</p>
            {user.role === "student" && (
              <Link
                to="/courses"
                className="text-[#2563EB] font-medium text-sm hover:text-[#1E3A8A] transition-colors"
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Link
                to={`/courses/${course._id}`}
                key={course._id}
                className="border border-[#E5E7EB] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-36 bg-[#DBEAFE] flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-[#2563EB]" />
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium text-[#2563EB] mb-1 block">
                    {course.category}
                  </span>
                  <h3 className="font-semibold text-[#111827] text-sm mb-2 leading-snug">
                    {course.title}
                  </h3>

                  {user.role !== "instructor" && course.instructor && (
                    <p className="text-xs text-[#6B7280] mb-3">
                      {course.instructor.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.studentsEnrolled?.length || 0} students
                    </span>

                    {user.role === "instructor" ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          course.status === "published"
                            ? "bg-green-50 text-green-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    ) : (
                      course.rating?.average > 0 && (
                        <span className="flex items-center gap-1 font-medium text-[#111827]">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {course.rating.average.toFixed(1)}
                        </span>
                      )
                    )}
                  </div>

                  {user.role === "instructor" && (
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/edit-course/${course._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, course._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-red-500 hover:border-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}

                  {user.role === "admin" && (
                    <button
                      onClick={(e) => handleDelete(e, course._id)}
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-red-500 hover:border-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Course
                    </button>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCoursesPage
