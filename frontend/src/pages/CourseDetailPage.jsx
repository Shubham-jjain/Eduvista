import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { BookOpen, Users, Star, Loader2, Clock, ChevronDown, PlayCircle, FileText, ArrowLeft, X, CheckCircle, Download, Lock } from "lucide-react"
import API from "../api/axios"
import Navbar from "../components/Navbar"
import VideoPlayer from "../components/VideoPlayer"
import PaymentModal from "../components/PaymentModal"
import ReviewSection from "../components/ReviewSection"
import useInView from "../hooks/useInView"

// Displays full course details including sections, lessons, and instructor info
const CourseDetailPage = () => {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [activeLesson, setActiveLesson] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [canAccessContent, setCanAccessContent] = useState(false)
  const [progress, setProgress] = useState(null)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [quizAttempts, setQuizAttempts] = useState({})
  const [enrolling, setEnrolling] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [sectionsRef, sectionsInView] = useInView()
  const [sidebarRef, sidebarInView] = useInView()

  useEffect(() => {
    fetchCourse()
  }, [id])

  // Fetches a single course by ID and checks enrollment + progress
  const fetchCourse = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await API.get(`/courses/${id}`)
      const courseData = res.data.course
      setCourse(courseData)

      const instructorId = courseData.instructor?._id || courseData.instructor
      const enrolled = user && user.role === "student" && courseData.studentsEnrolled?.some(sid => sid.toString() === user._id.toString())
      const isOwner = user && instructorId?.toString() === user._id?.toString()
      const isAdmin = user && user.role === "admin"

      if (enrolled) setIsEnrolled(true)
      if (enrolled || isOwner || isAdmin) setCanAccessContent(true)

      if (enrolled) {
        try {
          const progressRes = await API.get(`/progress/${id}`)
          setProgress(progressRes.data.progress)
        } catch {
          setProgress(null)
        }

        // Fetch quiz attempts for sections that have quizzes
        const attempts = {}
        for (const section of courseData.sections) {
          if (section.quiz?.questions?.length > 0) {
            try {
              const attemptRes = await API.get(`/quiz/attempt/${id}/${section._id}`)
              if (attemptRes.data.attempt) {
                attempts[section._id] = attemptRes.data.attempt
              }
            } catch {
              // silent fail for quiz attempt fetch
            }
          }
        }
        setQuizAttempts(attempts)
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course")
    } finally {
      setLoading(false)
    }
  }

  // Marks the active lesson as complete and updates progress
  const handleMarkComplete = async () => {
    if (!activeLesson || markingComplete) return
    setMarkingComplete(true)
    try {
      const res = await API.post("/progress/lesson-complete", {
        courseId: id,
        lessonId: activeLesson._id,
      })
      setProgress(res.data.progress)
    } catch (err) {
      console.error("Mark complete error:", err)
    } finally {
      setMarkingComplete(false)
    }
  }

  // Enrolls the student in a free course directly
  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await API.post(`/enroll/${id}`)
      await fetchCourse()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll")
    } finally {
      setEnrolling(false)
    }
  }

  // Called after mock payment succeeds for paid courses
  const handlePaymentSuccess = async () => {
    try {
      await API.post(`/enroll/${id}`)
      setShowPaymentModal(false)
      await fetchCourse()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enroll")
      setShowPaymentModal(false)
    }
  }

  // Downloads the certificate PDF for a completed course
  const handleDownloadCertificate = async () => {
    try {
      const res = await API.get(`/certificate/${id}`, { responseType: "blob" })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `certificate-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download certificate error:", err)
    }
  }

  // Updates last accessed lesson when a lesson is clicked (only if user can access content)
  const handleLessonClick = async (lesson) => {
    if (!canAccessContent) return
    setActiveLesson(lesson)
    if (isEnrolled) {
      try {
        await API.put("/progress/last-accessed", { courseId: id, lessonId: lesson._id })
      } catch {
        // silent fail for last-accessed tracking
      }
    }
  }

  // Checks if a lesson has been completed
  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some((id) => id.toString() === lessonId.toString()) || false
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
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin mb-3" />
          <p className="text-sm text-[#6B7280]">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center py-20 animate-fade-in">
            <BookOpen className="w-16 h-16 text-[#DBEAFE] mx-auto mb-4" />
            <p className="text-lg font-medium text-[#111827] mb-1">{error || "Course not found"}</p>
            <p className="text-sm text-[#6B7280] mb-6">The course you're looking for may have been removed or doesn't exist</p>
            <Link to="/courses" className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98]">
              <ArrowLeft className="w-4 h-4" />
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/courses" className="animate-fade-in-up group inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#2563EB] mb-6 transition-colors duration-200" style={{ animationDelay: '100ms' }}>
          <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
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
                {isEnrolled && (
                  <button
                    onClick={handleMarkComplete}
                    disabled={markingComplete || isLessonCompleted(activeLesson._id)}
                    className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLessonCompleted(activeLesson._id)
                        ? "bg-green-50 text-green-600 cursor-default"
                        : "bg-[#2563EB] text-white hover:bg-[#1E3A8A] cursor-pointer"
                    }`}
                  >
                    {isLessonCompleted(activeLesson._id) ? (
                      <><CheckCircle className="w-4 h-4" /> Completed</>
                    ) : markingComplete ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Marking...</>
                    ) : (
                      "Mark as Complete"
                    )}
                  </button>
                )}
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

            <span className={`animate-fade-in-up inline-block bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium px-3 py-1 rounded-full mb-3`} style={{ animationDelay: '200ms' }}>{course.category}</span>
            <h1 className="animate-fade-in-up font-serif text-2xl md:text-3xl text-[#1E3A8A] mb-3" style={{ animationDelay: '300ms' }}>{course.title}</h1>

            <div className="animate-fade-in-up flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-6" style={{ animationDelay: '400ms' }}>
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

            <p className="animate-fade-in-up text-[#6B7280] text-sm leading-relaxed mb-8" style={{ animationDelay: '500ms' }}>{course.description}</p>

            {/* Course Content / Sections */}
            {course.sections?.length > 0 && (
              <div ref={sectionsRef}>
                <h2 className="font-serif text-xl text-[#1E3A8A] mb-4">
                  Course Content
                  <span className="text-sm font-normal font-sans text-[#6B7280] ml-2">
                    {course.sections.length} sections · {stats.lessons} lessons
                  </span>
                </h2>

                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  {course.sections.map((section, sIdx) => (
                    <div key={sIdx} className={`border-b border-[#E5E7EB] last:border-b-0 reveal-on-scroll ${sectionsInView ? 'revealed' : ''}`} style={{ transitionDelay: `${sIdx * 60}ms` }}>
                      <button
                        onClick={() => toggleSection(sIdx)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${openSections[sIdx] ? 'rotate-0' : '-rotate-90'}`} />
                          <span className="text-sm font-medium text-[#111827]">{section.title}</span>
                        </div>
                        <span className="text-xs text-[#6B7280]">
                          {section.lessons?.length || 0} lessons
                        </span>
                      </button>

                      {openSections[sIdx] && (section.lessons?.length > 0 || section.quiz?.questions?.length > 0) && (
                        <div className="bg-[#F9FAFB] px-4 pb-3">
                          {section.lessons?.map((lesson, lIdx) => (
                            <button
                              key={lIdx}
                              onClick={() => handleLessonClick(lesson)}
                              disabled={!canAccessContent}
                              className={`w-full flex items-center justify-between py-2 px-3 rounded transition-all duration-200 ${
                                canAccessContent
                                  ? `cursor-pointer hover:bg-[#DBEAFE] ${activeLesson?._id === lesson._id ? "bg-[#DBEAFE] border-l-2 border-l-[#2563EB]" : ""}`
                                  : "cursor-not-allowed opacity-60"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {!canAccessContent ? (
                                  <Lock className="w-3.5 h-3.5 text-[#6B7280]" />
                                ) : isEnrolled && isLessonCompleted(lesson._id) ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <PlayCircle className={`w-3.5 h-3.5 ${activeLesson?._id === lesson._id ? "text-[#2563EB]" : "text-[#6B7280]"}`} />
                                )}
                                <span className={`text-sm ${activeLesson?._id === lesson._id ? "text-[#2563EB] font-medium" : "text-[#111827]"}`}>{lesson.title}</span>
                              </div>
                              {lesson.duration > 0 && (
                                <span className="text-xs text-[#6B7280]">{lesson.duration} min</span>
                              )}
                            </button>
                          ))}
                          {section.quiz?.questions?.length > 0 && (
                            isEnrolled ? (
                              <Link
                                to={`/courses/${id}/quiz/${section._id}`}
                                className="w-full flex items-center justify-between py-2 px-3 rounded hover:bg-[#DBEAFE] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {quizAttempts[section._id]?.passed ? (
                                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                                  )}
                                  <span className="text-sm text-[#2563EB] font-medium">
                                    Quiz · {section.quiz.questions.length} questions
                                  </span>
                                </div>
                                {quizAttempts[section._id] && (
                                  <span className={`text-xs font-medium ${quizAttempts[section._id].passed ? "text-green-600" : "text-yellow-600"}`}>
                                    {quizAttempts[section._id].percentage}% {quizAttempts[section._id].passed ? "Passed" : "Not passed"}
                                  </span>
                                )}
                              </Link>
                            ) : (
                              <div className="flex items-center gap-2 py-2 px-3">
                                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                                <span className="text-sm text-[#2563EB] font-medium">
                                  Quiz · {section.quiz.questions.length} questions
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              courseId={id}
              isEnrolled={isEnrolled}
              user={user}
              onReviewChange={fetchCourse}
            />
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} className={`lg:col-span-1 reveal-on-scroll ${sidebarInView ? 'revealed' : ''}`}>
            <div className="border border-[#E5E7EB] rounded-xl p-6 sticky top-8">
              {!isEnrolled && (
                <p className="text-2xl font-bold text-[#111827] mb-4">
                  {course.price === 0 ? "Free" : `$${course.price}`}
                </p>
              )}

              {course.status === "draft" && (
                <span className="inline-block text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded mb-4">
                  Draft
                </span>
              )}

              {/* Enrollment / Progress */}
              {isEnrolled && progress ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#111827]">Your Progress</span>
                    <span className="text-sm font-medium text-[#2563EB]">{progress.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress.progressPercentage}%` }}
                    />
                  </div>
                  {progress.completed && (
                    <p className="mt-2 text-xs font-medium text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Course Completed
                    </p>
                  )}
                  {progress.progressPercentage >= 95 && (
                    <button
                      onClick={handleDownloadCertificate}
                      className="w-full mt-3 flex items-center justify-center gap-2 bg-[#1E3A8A] text-white py-2.5 rounded-lg font-medium hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Certificate
                    </button>
                  )}
                </div>
              ) : !isEnrolled && user?.role === "student" && course.status === "published" ? (
                <div className="mb-4">
                  {course.price === 0 ? (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-lg font-medium hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 cursor-pointer"
                    >
                      {enrolling ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enrolling...
                        </span>
                      ) : (
                        "Enroll for Free"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-lg font-medium hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98] cursor-pointer"
                    >
                      Buy for ${course.price}
                    </button>
                  )}
                </div>
              ) : !user && course.status === "published" ? (
                <div className="mb-4">
                  <Link
                    to="/login"
                    className="block w-full text-center bg-[#1E3A8A] text-white py-2.5 rounded-lg font-medium hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98]"
                  >
                    Log in to Enroll
                  </Link>
                </div>
              ) : null}

              {/* Instructor */}
              {course.instructor && (
                <div className="border-t border-[#E5E7EB] pt-4 mt-4">
                  <h3 className="font-serif text-sm text-[#1E3A8A] mb-3">Instructor</h3>
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
                        <span key={i} className="text-xs bg-[#DBEAFE] text-[#1E3A8A] px-2.5 py-0.5 rounded-full">
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

      {/* Payment modal for paid courses */}
      {showPaymentModal && (
        <PaymentModal
          course={course}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

export default CourseDetailPage
