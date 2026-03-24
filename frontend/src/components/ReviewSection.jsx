import { useState, useEffect } from "react"
import { Star, Loader2, Pencil, Trash2 } from "lucide-react"
import API from "../api/axios"

// Displays course reviews list and review form for enrolled students
const ReviewSection = ({ courseId, isEnrolled, user, onReviewChange }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [courseId])

  // Fetches all reviews for this course
  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${courseId}`)
      setReviews(res.data.reviews)
    } catch (err) {
      console.error("Fetch reviews error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Checks if the current user has already submitted a review
  const userReview = user ? reviews.find((r) => r.user._id === user._id) : null
  const canReview = isEnrolled && user?.role === "student" && !userReview && !editingId

  // Handles submitting a new review or updating an existing one
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !comment.trim()) {
      setError("Please select a rating and write a comment")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await API.put(`/reviews/${editingId}`, { rating, comment })
      } else {
        await API.post("/reviews", { courseId, rating, comment })
      }
      setRating(0)
      setComment("")
      setEditingId(null)
      await fetchReviews()
      if (onReviewChange) onReviewChange()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  // Sets up the form for editing an existing review
  const handleEdit = (review) => {
    setEditingId(review._id)
    setRating(review.rating)
    setComment(review.comment)
    setError(null)
  }

  // Cancels the edit mode
  const handleCancelEdit = () => {
    setEditingId(null)
    setRating(0)
    setComment("")
    setError(null)
  }

  // Deletes a review
  const handleDelete = async (reviewId) => {
    try {
      await API.delete(`/reviews/${reviewId}`)
      await fetchReviews()
      if (onReviewChange) onReviewChange()
    } catch (err) {
      console.error("Delete review error:", err)
    }
  }

  // Renders clickable star rating input
  const StarInput = () => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="cursor-pointer"
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hoverRating || rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-[#E5E7EB]"
            }`}
          />
        </button>
      ))}
    </div>
  )

  // Renders static star display for a review
  const StarDisplay = ({ value }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= value ? "text-yellow-500 fill-yellow-500" : "text-[#E5E7EB]"
          }`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#1E3A8A] mb-4">Reviews</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-[#1E3A8A] mb-4">
        Reviews {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      {/* Review form — visible for enrolled students who haven't reviewed yet, or when editing */}
      {(canReview || editingId) && (
        <form onSubmit={handleSubmit} className="border border-[#E5E7EB] rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">
            {editingId ? "Edit Your Review" : "Write a Review"}
          </h3>

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Rating</label>
            <StarInput />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this course..."
              rows={3}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 mb-3">{error}</p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1E3A8A] transition-colors disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {editingId ? "Updating..." : "Submitting..."}
                </span>
              ) : editingId ? "Update Review" : "Submit Review"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-[#E5E7EB] text-[#6B7280] px-4 py-2 rounded-lg text-sm hover:text-[#2563EB] hover:border-[#2563EB] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-sm text-[#6B7280] text-center py-6">No reviews yet. Be the first to review this course!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border border-[#E5E7EB] rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {review.user.profileImage ? (
                    <img
                      src={review.user.profileImage}
                      alt={review.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                      <span className="text-xs font-bold text-[#1E3A8A]">
                        {review.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-[#111827]">{review.user.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay value={review.rating} />
                  {user && (review.user._id === user._id || user.role === "admin") && !editingId && (
                    <div className="flex items-center gap-1 ml-2">
                      {review.user._id === user._id && (
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-1 hover:bg-[#F3F4F6] rounded transition-colors cursor-pointer"
                          title="Edit review"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#6B7280]" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#111827] leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewSection
