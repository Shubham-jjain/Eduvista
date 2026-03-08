import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { setUser } from '../features/auth/authSlice'

const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(setUser(null))
    navigate('/login')
  }

  return (
    <nav className="border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-[#1E3A8A]" />
          <span className="text-xl font-bold text-[#1E3A8A]">EduVista</span>
        </Link>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors text-sm cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
