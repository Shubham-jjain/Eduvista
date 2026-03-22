import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Users, Star, Loader2, Search } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"

const categories = ["Development", "Data Science", "Design", "Marketing", "Business", "Photography"]

// Displays all published courses with category filter and search
const AllCoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [category])

  // Fetches published courses from the backend with optional filters
  const fetchCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (category) params.category = category
      if (search.trim()) params.search = search.trim()
      const res = await API.get("/courses", { params })
      setCourses(res.data.courses)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  // Handles search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#111827] mb-8">All Courses</h1>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A8A] transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
            <p className="text-[#6B7280]">No courses found.</p>
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

                  {course.instructor && (
                    <p className="text-xs text-[#6B7280] mb-3">
                      {course.instructor.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.studentsEnrolled?.length || 0} students
                    </span>

                    <div className="flex items-center gap-3">
                      {course.rating?.average > 0 && (
                        <span className="flex items-center gap-1 font-medium text-[#111827]">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {course.rating.average.toFixed(1)}
                        </span>
                      )}
                      <span className="font-semibold text-[#111827]">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllCoursesPage
