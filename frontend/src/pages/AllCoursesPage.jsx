import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Users, Star, Loader2, Search } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import useInView from "../hooks/useInView"

const categories = ["Development", "Data Science", "Design", "Marketing", "Business", "Photography"]

// Displays all published courses with category filter and search
const AllCoursesPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState("")
  const [search, setSearch] = useState("")

  const [cardsRef, cardsInView] = useInView()

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
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="animate-fade-in-up font-serif text-3xl md:text-4xl text-[#1E3A8A] mb-2" style={{ animationDelay: '100ms' }}>
          All Courses
        </h1>
        <p className="animate-fade-in-up text-[#6B7280] text-lg mb-8" style={{ animationDelay: '200ms' }}>
          Browse our catalog and find the perfect course for your goals
        </p>

        {/* Filters */}
        <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mb-8" style={{ animationDelay: '300ms' }}>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              Search
            </button>
          </form>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
            <p className="text-sm text-[#6B7280]">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <BookOpen className="w-16 h-16 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#111827] mb-1">No courses found</p>
            <p className="text-sm text-[#6B7280]">Try adjusting your search or filter criteria</p>
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
                <div className="h-40 bg-[#DBEAFE] overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-[#2563EB]" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="inline-block bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium px-3 py-1 rounded-full mb-2">
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
                          <Star className="w-3.5 h-3.5 text-[#2563EB] fill-[#2563EB]" />
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
