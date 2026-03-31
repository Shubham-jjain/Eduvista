# EduVista - Online Learning & Skill Management Platform

A full-stack online learning platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Students can enroll in courses and track progress, instructors can create and manage course content, and administrators can monitor the entire system.

**Live Demo:** <a href="https://eduvista-qphasgpw7-shubham-jjains-projects.vercel.app" target="_blank">https://eduvista-qphasgpw7-shubham-jjains-projects.vercel.app</a>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Email verification via 6-digit OTP
- Role-based access control (Student, Instructor, Admin)
- Secure password hashing with bcryptjs

### Student
- Browse and search courses by category or keyword
- Enroll in free and paid courses
- Track lesson completion and overall course progress
- Take quizzes with instant grading and pass/fail evaluation
- Download PDF certificates upon course completion (95%+ progress)
- Rate and review enrolled courses

### Instructor
- Create courses with sections, video lessons, and quizzes
- Upload course thumbnails via Cloudinary
- Save courses as draft or publish them
- View course performance analytics (enrollments, ratings, revenue)
- Respond to student reviews

### Admin
- Manage users (activate, deactivate, change roles)
- Manage and delete courses across the platform
- View platform-wide statistics and analytics
- Monitor recent activity (registrations, enrollments, reviews)
- Visual analytics with charts (user breakdown, top courses)

### Dashboards
- **Student Dashboard** - Enrolled courses, progress, quiz results, continue learning
- **Instructor Dashboard** - Course performance, revenue, rating distribution, recent reviews
- **Admin Dashboard** - Platform stats, user management, course management, activity feed

### Additional
- Email notifications (verification, welcome, enrollment, certificate, password change)
- Responsive design (mobile-first)
- Mock payment system for paid courses
- Resume learning from last accessed lesson

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI library |
| Vite 7 | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Redux Toolkit | State management |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Recharts | Analytics charts |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime |
| Express 5 | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Cloudinary | Media storage |
| Nodemailer | Email service |
| PDFKit | Certificate generation |
| Multer | File upload handling |
| express-validator | Input validation |
| Socket.io | Real-time communication |

---

## Architecture

```
EduVista/
├── frontend/                   # React client application
│   ├── src/
│   │   ├── api/                # Axios instance & API config
│   │   ├── app/                # Redux store
│   │   ├── components/         # Reusable UI components
│   │   ├── features/           # Redux slices
│   │   └── pages/              # Page components
│   ├── public/
│   └── vite.config.js
│
├── backend/                    # Express server application
│   ├── config/                 # DB, Cloudinary, Nodemailer config
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth & role middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Email & certificate services
│   └── server.js               # Entry point
│
└── README.md
```

### Data Model

```
User ──┬── enrolledCourses ──── Course
       │                          ├── Sections (embedded)
       │                          │    ├── Lessons (embedded)
       │                          │    └── Quiz (embedded)
       │                          └── studentsEnrolled
       │
       ├── Progress ──────────── Course
       ├── QuizAttempt ──────── Course + Section
       ├── Review ───────────── Course
       ├── Certificate ─────── Course
       └── Payment ──────────── Course
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Gmail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/EduVista.git
   cd EduVista
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Create `backend/.env` using the template in `backend/.env.example`:
   ```env
   MONGO_DB=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SENDER_EMAIL=your_email@gmail.com
   SENDER_EMAIL_PASS=your_gmail_app_password
   CORS_ORIGIN=http://localhost:5173
   PORT=5001
   ```

5. **Run the development servers**

   Backend (runs on port 5001):
   ```bash
   cd backend
   npm run dev
   ```

   Frontend (runs on port 5173):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open the app**

   Navigate to `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_DB` | MongoDB Atlas connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWTs | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `SENDER_EMAIL` | Gmail address for sending emails | Yes |
| `SENDER_EMAIL_PASS` | Gmail app password | Yes |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated | Yes |
| `PORT` | Server port (default: 5001) | No |
| `NODE_ENV` | Environment (`production` or `development`) | No |

### Frontend (Vercel / `.env.production`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://your-backend.onrender.com/api`) | Yes |

---

## API Reference

All routes are prefixed with `/api`.

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/verify-email` | Verify email with OTP code | Public |
| POST | `/api/auth/resend-code` | Resend verification code | Public |
| POST | `/api/auth/login` | Login with credentials | Public |
| POST | `/api/auth/logout` | Logout (clear cookie) | Authenticated |

### User Profile
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/user/profile` | Get current user profile | Authenticated |
| PUT | `/api/user/profile` | Update profile details | Authenticated |
| PUT | `/api/user/profile/image` | Upload profile image | Authenticated |
| PUT | `/api/user/profile/password` | Change password | Authenticated |

### Courses
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/courses` | Get all published courses | Public |
| GET | `/api/courses/:id` | Get course details | Public |
| GET | `/api/courses/my-courses` | Get role-based course list | Authenticated |
| POST | `/api/courses` | Create new course | Instructor |
| PUT | `/api/courses/:id` | Update course | Instructor (owner) |
| DELETE | `/api/courses/:id` | Delete course | Instructor (owner) / Admin |

### Enrollment
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/enroll/:courseId` | Enroll in a course | Student |
| GET | `/api/enroll/my-courses` | Get enrolled courses | Student |

### Progress
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/progress/lesson-complete` | Mark lesson complete | Student |
| PUT | `/api/progress/last-accessed` | Update last accessed lesson | Student |
| GET | `/api/progress/:courseId` | Get course progress | Student |

### Quizzes
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/quiz/:courseId/:sectionId` | Get quiz questions | Student |
| POST | `/api/quiz/submit` | Submit quiz answers | Student |
| GET | `/api/quiz/attempt/:courseId/:sectionId` | Get quiz attempt | Student |

### Certificates
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/certificate/:courseId` | Generate & download PDF | Student (95%+ progress) |

### Reviews
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/reviews/:courseId` | Get course reviews | Public |
| POST | `/api/reviews` | Create review | Student (enrolled) |
| PUT | `/api/reviews/:reviewId` | Update review | Student (owner) |
| DELETE | `/api/reviews/:reviewId` | Delete review | Student (owner) / Admin |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/student/*` | Student analytics | Student |
| GET | `/api/dashboard/instructor/*` | Instructor analytics | Instructor |
| GET | `/api/dashboard/admin/*` | Admin management & stats | Admin |

---

## Deployment

The application is deployed as two separate services:

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [eduvista-qphasgpw7-shubham-jjains-projects.vercel.app](https://eduvista-qphasgpw7-shubham-jjains-projects.vercel.app) |
| Backend | Render | example.onrender.com |
| Database | MongoDB Atlas | Cloud-hosted |

### Deploy Your Own

**Backend (Render):**
1. Create a new Web Service on [Render](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

**Frontend (Vercel):**
1. Import project on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Framework preset: Vite
4. Add `VITE_API_URL` environment variable pointing to your Render backend

> **Note:** Set `CORS_ORIGIN` on Render to your Vercel production URL after deploying.

---

## Screenshots

> _Screenshots can be added here to showcase the platform UI._

<!--
![Home Page](screenshots/home.png)
![Student Dashboard](screenshots/student-dashboard.png)
![Course Detail](screenshots/course-detail.png)
![Admin Dashboard](screenshots/admin-dashboard.png)
-->

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

<p align="center">Built with the MERN Stack</p>
