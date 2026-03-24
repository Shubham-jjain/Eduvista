# Review System — How It Works

## Overview

The review system allows enrolled students to rate courses (1-5 stars) and leave written feedback. Reviews are displayed on the Course Detail Page. The course's average rating and review count update automatically whenever reviews are created, edited, or deleted.

---

## Data Flow

### 1. Student Submits a Review

```
Student clicks "Submit Review" on CourseDetailPage
        ↓
Frontend sends POST /api/reviews { courseId, rating, comment }
        ↓
Backend checks:
  - Is user authenticated? (authMiddleware)
  - Is user a student? (roleMiddleware)
  - Is user enrolled in this course? (checks course.studentsEnrolled)
  - Has user already reviewed? (checks for existing review — 409 if yes)
        ↓
Creates Review document in MongoDB
        ↓
Recalculates course rating:
  - Aggregates all reviews for this course
  - Computes new average and count
  - Updates course.rating.average and course.rating.count
        ↓
Returns populated review (with user name + profile image)
        ↓
Frontend refreshes reviews list AND course data (updates header rating display)
```

### 2. Student Edits Their Review

```
Student clicks pencil icon on their review → form pre-fills with existing data
        ↓
Student modifies rating/comment and clicks "Update Review"
        ↓
Frontend sends PUT /api/reviews/:reviewId { rating, comment }
        ↓
Backend checks ownership (only review author can edit)
        ↓
Updates Review document → Recalculates course rating
        ↓
Frontend refreshes reviews list + course data
```

### 3. Review is Deleted

```
Student clicks trash icon on their review (or admin deletes it)
        ↓
Frontend sends DELETE /api/reviews/:reviewId
        ↓
Backend checks: is user the review owner OR an admin?
        ↓
Deletes Review document → Recalculates course rating
        ↓
Frontend refreshes reviews list + course data
```

---

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/reviews` | Required | Student | Create a new review |
| GET | `/api/reviews/:courseId` | None | Any | Get all reviews for a course |
| PUT | `/api/reviews/:reviewId` | Required | Owner | Update own review |
| DELETE | `/api/reviews/:reviewId` | Required | Owner/Admin | Delete a review |

---

## Database

### Review Model (`backend/models/review.model.js`)

| Field | Type | Details |
|-------|------|---------|
| user | ObjectId | References User model |
| course | ObjectId | References Course model |
| rating | Number | 1-5, required |
| comment | String | Required |
| createdAt | Date | Auto-generated |
| updatedAt | Date | Auto-generated |

- **Unique constraint:** One review per student per course (compound index on `{ user, course }`)

### Course Rating Fields (updated automatically)

| Field | Description |
|-------|-------------|
| `rating.average` | Average of all review ratings (rounded to 1 decimal) |
| `rating.count` | Total number of reviews |

---

## Rating Recalculation

Every time a review is created, updated, or deleted, the `recalculateCourseRating` helper runs:

```
1. Aggregate all reviews for the course
2. Calculate: average = sum of ratings / total reviews
3. Round to 1 decimal place
4. Update course document with new average and count
5. If no reviews remain → set average = 0, count = 0
```

This uses MongoDB's aggregation pipeline (`$avg`, `$sum`) for accurate server-side calculation.

---

## Frontend Components

### ReviewSection (`frontend/src/components/ReviewSection.jsx`)

A self-contained component that handles everything:

- **Review Form:** Star rating input (clickable, with hover effect) + text area + submit button
  - Only visible to enrolled students who haven't reviewed yet, or when editing
- **Reviews List:** Shows all reviews with user avatar, name, date, star rating, and comment
  - Edit/Delete buttons visible only on the user's own review
  - Admin can delete any review

### Where It Appears

Rendered at the bottom of the main content column on `CourseDetailPage`, after the Course Content (sections/lessons) section.

---

## Access Rules

| User State | Can See Reviews | Can Write Review | Can Edit | Can Delete |
|------------|-----------------|------------------|----------|------------|
| Not logged in | Yes | No | No | No |
| Student (not enrolled) | Yes | No | No | No |
| Student (enrolled, no review) | Yes | Yes | No | No |
| Student (enrolled, has review) | Yes | No (form hidden) | Own only | Own only |
| Instructor | Yes | No | No | No |
| Admin | Yes | No | No | Any review |

---

## Files

| File | Purpose |
|------|---------|
| `backend/models/review.model.js` | Review schema + unique index |
| `backend/controllers/review.controller.js` | CRUD handlers + rating recalculation |
| `backend/routes/review.route.js` | Route definitions |
| `frontend/src/components/ReviewSection.jsx` | Review UI (form + list) |
| `frontend/src/pages/CourseDetailPage.jsx` | Integrates ReviewSection |
