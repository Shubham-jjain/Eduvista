import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Plus, Trash2, ImagePlus, HelpCircle, Loader2 } from "lucide-react"
import Navbar from "../components/Navbar"
import API from "../api/axios"

const categories = ["Development", "Data Science", "Design", "Marketing", "Business", "Photography"]

// Course edit form that loads existing course data and submits updates
const EditCoursePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [status, setStatus] = useState("draft")
  const [sections, setSections] = useState([])
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCourse()
  }, [id])

  // Fetches existing course data and pre-fills all form fields
  const fetchCourse = async () => {
    try {
      const res = await API.get(`/courses/${id}`)
      const course = res.data.course
      setTitle(course.title)
      setDescription(course.description)
      setCategory(course.category)
      setPrice(String(course.price))
      setStatus(course.status)
      setSections(
        course.sections?.map((s) => ({
          title: s.title,
          lessons: s.lessons?.map((l) => ({
            title: l.title,
            videoUrl: l.videoUrl || "",
            notes: l.notes || "",
            duration: l.duration ? String(l.duration) : "",
          })) || [],
          quiz: s.quiz
            ? {
                passPercentage: s.quiz.passPercentage || 50,
                questions: s.quiz.questions?.map((q) => ({
                  question: q.question,
                  options: q.options?.length === 4 ? [...q.options] : ["", "", "", ""],
                  correctAnswer: q.correctAnswer || 0,
                })) || [],
              }
            : null,
        })) || []
      )
      if (course.thumbnail) setThumbnailPreview(course.thumbnail)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course")
    } finally {
      setFetching(false)
    }
  }

  // Submits updated course data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      formData.append("price", price)
      formData.append("status", status)
      formData.append("sections", JSON.stringify(sections))

      const file = fileInputRef.current?.files[0]
      if (file) formData.append("thumbnail", file)

      await API.put(`/courses/${id}`, formData)

      setSuccess("Course updated successfully!")
      setTimeout(() => navigate("/my-courses"), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course")
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Validates image file and sets thumbnail preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setThumbnailPreview(URL.createObjectURL(file))
  }

  // Adds a new empty section to the sections array
  const addSection = () => {
    setSections([...sections, { title: "", lessons: [], quiz: null }])
  }

  // Removes a section at the given index
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  // Updates a field on a specific section
  const updateSection = (index, field, value) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], [field]: value }
    setSections(updated)
  }

  // Adds a new empty lesson to a section
  const addLesson = (sectionIndex) => {
    const updated = [...sections]
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      lessons: [...updated[sectionIndex].lessons, { title: "", videoUrl: "", notes: "", duration: "" }],
    }
    setSections(updated)
  }

  // Removes a lesson from a section
  const removeLesson = (sectionIndex, lessonIndex) => {
    const updated = [...sections]
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      lessons: updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex),
    }
    setSections(updated)
  }

  // Updates a field on a specific lesson
  const updateLesson = (sectionIndex, lessonIndex, field, value) => {
    const updated = [...sections]
    const lessons = [...updated[sectionIndex].lessons]
    lessons[lessonIndex] = { ...lessons[lessonIndex], [field]: value }
    updated[sectionIndex] = { ...updated[sectionIndex], lessons }
    setSections(updated)
  }

  // Toggles quiz on/off for a section
  const toggleQuiz = (sectionIndex) => {
    const updated = [...sections]
    if (updated[sectionIndex].quiz) {
      updated[sectionIndex] = { ...updated[sectionIndex], quiz: null }
    } else {
      updated[sectionIndex] = {
        ...updated[sectionIndex],
        quiz: { passPercentage: 50, questions: [] },
      }
    }
    setSections(updated)
  }

  // Updates quiz pass percentage for a section
  const updateQuizPassPercentage = (sectionIndex, value) => {
    const updated = [...sections]
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      quiz: { ...updated[sectionIndex].quiz, passPercentage: Number(value) },
    }
    setSections(updated)
  }

  // Adds a new empty question to a section's quiz
  const addQuestion = (sectionIndex) => {
    const updated = [...sections]
    const quiz = { ...updated[sectionIndex].quiz }
    quiz.questions = [...quiz.questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]
    updated[sectionIndex] = { ...updated[sectionIndex], quiz }
    setSections(updated)
  }

  // Removes a question from a section's quiz
  const removeQuestion = (sectionIndex, questionIndex) => {
    const updated = [...sections]
    const quiz = { ...updated[sectionIndex].quiz }
    quiz.questions = quiz.questions.filter((_, i) => i !== questionIndex)
    updated[sectionIndex] = { ...updated[sectionIndex], quiz }
    setSections(updated)
  }

  // Updates a field on a specific quiz question
  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    const updated = [...sections]
    const quiz = { ...updated[sectionIndex].quiz }
    const questions = [...quiz.questions]
    questions[questionIndex] = { ...questions[questionIndex], [field]: value }
    quiz.questions = questions
    updated[sectionIndex] = { ...updated[sectionIndex], quiz }
    setSections(updated)
  }

  // Updates a specific option on a quiz question
  const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
    const updated = [...sections]
    const quiz = { ...updated[sectionIndex].quiz }
    const questions = [...quiz.questions]
    const options = [...questions[questionIndex].options]
    options[optionIndex] = value
    questions[questionIndex] = { ...questions[questionIndex], options }
    quiz.questions = questions
    updated[sectionIndex] = { ...updated[sectionIndex], quiz }
    setSections(updated)
  }

  const inputClass = "w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
  const labelClass = "block text-sm font-medium text-[#111827] mb-1.5"

  if (fetching) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-[#111827] mb-8">Edit Course</h1>

        {success && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Course Details */}
          <div className="border border-[#E5E7EB] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-[#111827] mb-5">Course Details</h2>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Web Development"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will students learn in this course?"
                  required
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    required
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Thumbnail</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#E5E7EB] rounded-lg text-sm text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer w-full justify-center"
                  >
                    <ImagePlus className="w-4 h-4" />
                    {thumbnailPreview ? "Change Image" : "Upload Image"}
                  </button>
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mt-3 w-full h-32 object-cover rounded-lg border border-[#E5E7EB]"
                    />
                  )}
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111827]">Sections</h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {sections.length === 0 && (
              <p className="text-sm text-[#6B7280] text-center py-8 border border-dashed border-[#E5E7EB] rounded-lg">
                No sections yet. Click "Add Section" to get started.
              </p>
            )}

            {sections.map((section, sIndex) => (
              <div key={sIndex} className="border border-[#E5E7EB] rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#111827]">Section {sIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSection(sIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className={labelClass}>Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(sIndex, "title", e.target.value)}
                    placeholder="e.g. Getting Started"
                    required
                    className={inputClass}
                  />
                </div>

                {/* Lessons */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#111827]">Lessons</span>
                    <button
                      type="button"
                      onClick={() => addLesson(sIndex)}
                      className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Lesson
                    </button>
                  </div>

                  {section.lessons.length === 0 && (
                    <p className="text-xs text-[#6B7280] text-center py-4 border border-dashed border-[#E5E7EB] rounded-lg">
                      No lessons yet.
                    </p>
                  )}

                  {section.lessons.map((lesson, lIndex) => (
                    <div key={lIndex} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-[#6B7280]">Lesson {lIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeLesson(sIndex, lIndex)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[#111827] mb-1">Lesson Title</label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(sIndex, lIndex, "title", e.target.value)}
                            placeholder="e.g. Introduction to HTML"
                            required
                            className={inputClass}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-[#111827] mb-1">Video URL</label>
                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(sIndex, lIndex, "videoUrl", e.target.value)}
                              placeholder="https://..."
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#111827] mb-1">Duration (min)</label>
                            <input
                              type="number"
                              value={lesson.duration}
                              onChange={(e) => updateLesson(sIndex, lIndex, "duration", e.target.value)}
                              placeholder="0"
                              min="0"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-[#111827] mb-1">Notes</label>
                          <textarea
                            value={lesson.notes}
                            onChange={(e) => updateLesson(sIndex, lIndex, "notes", e.target.value)}
                            placeholder="Additional notes for this lesson..."
                            rows={2}
                            className={`${inputClass} resize-none`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quiz Toggle */}
                <div className="border-t border-[#E5E7EB] pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-[#111827]">
                      <HelpCircle className="w-4 h-4 text-[#6B7280]" />
                      Quiz
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleQuiz(sIndex)}
                      className={`text-xs font-medium px-3 py-1 rounded-full transition-colors cursor-pointer ${
                        section.quiz
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-[#DBEAFE] text-[#2563EB] hover:bg-blue-200"
                      }`}
                    >
                      {section.quiz ? "Remove Quiz" : "Add Quiz"}
                    </button>
                  </div>

                  {section.quiz && (
                    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4">
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-[#111827] mb-1">
                          Pass Percentage
                        </label>
                        <input
                          type="number"
                          value={section.quiz.passPercentage}
                          onChange={(e) => updateQuizPassPercentage(sIndex, e.target.value)}
                          min="0"
                          max="100"
                          className={`${inputClass} max-w-30`}
                        />
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-[#111827]">Questions</span>
                        <button
                          type="button"
                          onClick={() => addQuestion(sIndex)}
                          className="flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Question
                        </button>
                      </div>

                      {section.quiz.questions.length === 0 && (
                        <p className="text-xs text-[#6B7280] text-center py-3 border border-dashed border-[#E5E7EB] rounded-lg">
                          No questions yet.
                        </p>
                      )}

                      {section.quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white border border-[#E5E7EB] rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-[#6B7280]">Question {qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeQuestion(sIndex, qIndex)}
                              className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-[#111827] mb-1">Question</label>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => updateQuestion(sIndex, qIndex, "question", e.target.value)}
                                placeholder="Enter your question"
                                required
                                className={inputClass}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {q.options.map((opt, oIndex) => (
                                <div key={oIndex}>
                                  <label className="block text-xs font-medium text-[#111827] mb-1">
                                    Option {oIndex + 1}
                                  </label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(sIndex, qIndex, oIndex, e.target.value)}
                                    placeholder={`Option ${oIndex + 1}`}
                                    required
                                    className={inputClass}
                                  />
                                </div>
                              ))}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-[#111827] mb-1">Correct Answer</label>
                              <select
                                value={q.correctAnswer}
                                onChange={(e) => updateQuestion(sIndex, qIndex, "correctAnswer", Number(e.target.value))}
                                className={`${inputClass} max-w-50`}
                              >
                                <option value={0}>Option 1</option>
                                <option value={1}>Option 2</option>
                                <option value={2}>Option 3</option>
                                <option value={3}>Option 4</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Updating Course..." : "Update Course"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditCoursePage
