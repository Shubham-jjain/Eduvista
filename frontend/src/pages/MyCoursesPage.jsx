import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { BookOpen, Users, Plus, Loader2, Star, Pencil, Trash2, CheckCircle } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import useInView from "../hooks/useInView"

// Displays role-based course list: enrolled, created, or all courses
const MyCoursesPage = () => {
  const { user } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardsRef, cardsInView] = useInView()

  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetches user's courses — students use enrollment endpoint with progress data
  const fetchCourses = async () => {
    try {
      const endpoint = user.role === "student" ? "/enroll/my-courses" : "/courses/my-courses"
      const res = await API.get(endpoint)
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
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="animate-fade-in-up font-serif text-3xl md:text-4xl text-[#1E3A8A]" style={{ animationDelay: '100ms' }}>{heading}</h1>
          {user.role === "instructor" && (
            <Link
              to="/create-course"
              className="animate-fade-in-up flex items-center gap-2 bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98]"
              style={{ animationDelay: '200ms' }}
            >
              <Plus className="w-4 h-4" />
              Create New Course
            </Link>
          )}
        </div>
        <p className="animate-fade-in-up text-[#6B7280] text-lg mb-8" style={{ animationDelay: '200ms' }}>
          {user.role === "student" ? "Track your learning progress" : user.role === "instructor" ? "Manage and grow your course catalog" : "Overview of all platform courses"}
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
            <p className="text-sm text-[#6B7280]">Loading your courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <BookOpen className="w-16 h-16 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#111827] mb-1">No courses yet</p>
            <p className="text-sm text-[#6B7280] mb-6">{emptyMessage}</p>
            {user.role === "student" && (
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98]"
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course, index) => (
              <Link
                to={`/courses/${course._id}`}
                key={course._id}
                className={`reveal-on-scroll border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-[#2563EB] hover:-translate-y-1 hover:shadow-sm transition-all duration-300 ${cardsInView ? 'revealed' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="h-40 bg-[#DBEAFE] overflow-hidden flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-[#2563EB]" />
                  )}
                </div>
                <div className="p-5">
                  <span className="inline-block bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium px-3 py-1 rounded-full mb-2">
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

                  {user.role === "student" && course.progress && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        {course.progress.completed ? (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="text-xs text-[#6B7280]">
                            {course.progress.progressPercentage}% complete
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            course.progress.completed ? "bg-green-500" : "bg-[#2563EB]"
                          }`}
                          style={{ width: `${course.progress.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {user.role === "instructor" && (
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/edit-course/${course._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#2563EB] hover:border-[#2563EB] transition-all duration-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={(e) => handleDelete(e, course._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-red-500 hover:border-red-500 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}

                  {user.role === "admin" && (
                    <button
                      onClick={(e) => handleDelete(e, course._id)}
                      className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#6B7280] hover:text-red-500 hover:border-red-500 transition-all duration-200"
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
