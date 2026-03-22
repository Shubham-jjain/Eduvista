import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { BookOpen, Users, Star, Loader2, Clock, ChevronDown, ChevronRight, PlayCircle, FileText, ArrowLeft, X } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import VideoPlayer from "../components/VideoPlayer"

// Displays full course details including sections, lessons, and instructor info
const CourseDetailPage = () => {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [activeLesson, setActiveLesson] = useState(null)

  useEffect(() => {
    fetchCourse()
  }, [id])

  // Fetches a single course by ID from the backend
  const fetchCourse = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get(`/courses/${id}`)
      setCourse(res.data.course)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  // Toggles a section's expanded/collapsed state
  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  // Calculates total lessons and duration across all sections
  const getTotalStats = () => {
    if (!course?.sections) return { lessons: 0, duration: 0 }
    let lessons = 0
    let duration = 0
    course.sections.forEach((section) => {
      lessons += section.lessons?.length || 0
      section.lessons?.forEach((lesson) => {
        duration += lesson.duration || 0
      })
    })
    return { lessons, duration }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-[#6B7280] mb-4">{error || "Course not found"}</p>
            <Link to="/courses" className="text-[#2563EB] text-sm font-medium hover:underline">
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#2563EB] mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video Player or Thumbnail */}
            {activeLesson ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-[#111827]">{activeLesson.title}</h3>
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="p-1 hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>
                <VideoPlayer url={activeLesson.videoUrl} title={activeLesson.title} />
                {activeLesson.notes && (
                  <p className="mt-3 text-sm text-[#6B7280] leading-relaxed">{activeLesson.notes}</p>
                )}
              </div>
            ) : (
              <div className="h-64 sm:h-80 bg-[#DBEAFE] rounded-lg overflow-hidden mb-6 flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-16 h-16 text-[#2563EB]" />
                )}
              </div>
            )}

            <span className="text-xs font-medium text-[#2563EB] mb-2 block">{course.category}</span>
            <h1 className="text-2xl font-bold text-[#111827] mb-3">{course.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-6">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {course.studentsEnrolled?.length || 0} students
              </span>
              {course.rating?.average > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {course.rating.average.toFixed(1)} ({course.rating.count} reviews)
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {stats.lessons} lessons
              </span>
              {stats.duration > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {Math.floor(stats.duration / 60)}h {stats.duration % 60}m
                </span>
              )}
            </div>

            <p className="text-[#6B7280] text-sm leading-relaxed mb-8">{course.description}</p>

            {/* Course Content / Sections */}
            {course.sections?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-[#111827] mb-4">
                  Course Content
                  <span className="text-sm font-normal text-[#6B7280] ml-2">
                    {course.sections.length} sections · {stats.lessons} lessons
                  </span>
                </h2>

                <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                  {course.sections.map((section, sIdx) => (
                    <div key={sIdx} className="border-b border-[#E5E7EB] last:border-b-0">
                      <button
                        onClick={() => toggleSection(sIdx)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          {openSections[sIdx] ? (
                            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                          )}
                          <span className="text-sm font-medium text-[#111827]">{section.title}</span>
                        </div>
                        <span className="text-xs text-[#6B7280]">
                          {section.lessons?.length || 0} lessons
                        </span>
                      </button>

                      {openSections[sIdx] && section.lessons?.length > 0 && (
                        <div className="bg-[#F9FAFB] px-4 pb-3">
                          {section.lessons.map((lesson, lIdx) => (
                            <button
                              key={lIdx}
                              onClick={() => setActiveLesson(lesson)}
                              className={`w-full flex items-center justify-between py-2 px-3 rounded hover:bg-[#DBEAFE] transition-colors cursor-pointer ${
                                activeLesson?._id === lesson._id ? "bg-[#DBEAFE]" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <PlayCircle className={`w-3.5 h-3.5 ${activeLesson?._id === lesson._id ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                                <span className={`text-sm ${activeLesson?._id === lesson._id ? "text-[#2563EB] font-medium" : "text-[#111827]"}`}>{lesson.title}</span>
                              </div>
                              {lesson.duration > 0 && (
                                <span className="text-xs text-[#6B7280]">{lesson.duration} min</span>
                              )}
                            </button>
                          ))}
                          {section.quiz?.questions?.length > 0 && (
                            <div className="flex items-center gap-2 py-2 px-3">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span className="text-sm text-[#2563EB] font-medium">
                                Quiz · {section.quiz.questions.length} questions
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="border border-[#E5E7EB] rounded-lg p-6 sticky top-8">
              <p className="text-2xl font-bold text-[#111827] mb-4">
                {course.price === 0 ? "Free" : `$${course.price}`}
              </p>

              {course.status === "draft" && (
                <span className="inline-block text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded mb-4">
                  Draft
                </span>
              )}

              {/* Instructor */}
              {course.instructor && (
                <div className="border-t border-[#E5E7EB] pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-[#111827] mb-3">Instructor</h3>
                  <div className="flex items-center gap-3 mb-3">
                    {course.instructor.profileImage ? (
                      <img
                        src={course.instructor.profileImage}
                        alt={course.instructor.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                        <span className="text-sm font-medium text-[#2563EB]">
                          {course.instructor.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium text-[#111827]">{course.instructor.name}</p>
                  </div>
                  {course.instructor.bio && (
                    <p className="text-xs text-[#6B7280] leading-relaxed mb-2">{course.instructor.bio}</p>
                  )}
                  {course.instructor.expertise?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {course.instructor.expertise.map((skill, i) => (
                        <span key={i} className="text-xs bg-[#DBEAFE] text-[#1E3A8A] px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailPage
