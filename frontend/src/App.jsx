import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from './features/auth/authSlice'
import API from './api/axios'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AllCoursesPage from './pages/AllCoursesPage'
import MyCoursesPage from './pages/MyCoursesPage'
import ProfilePage from './pages/ProfilePage'
import CreateCoursePage from './pages/CreateCoursePage'
import EditCoursePage from './pages/EditCoursePage'
import CourseDetailPage from './pages/CourseDetailPage'
import QuizPage from './pages/QuizPage'
import ProtectedRoute from './components/ProtectedRoute'

// Root component with session restoration and route definitions
const App = () => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await API.get('/user/profile')
        dispatch(setUser(res.data.user))
      } catch {
        // No valid session — user stays logged out
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/courses" element={<AllCoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/courses/:courseId/quiz/:sectionId" element={<ProtectedRoute roles={["student"]}><QuizPage /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/create-course" element={<ProtectedRoute roles={["instructor"]}><CreateCoursePage /></ProtectedRoute>} />
        <Route path="/edit-course/:id" element={<ProtectedRoute roles={["instructor"]}><EditCoursePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
