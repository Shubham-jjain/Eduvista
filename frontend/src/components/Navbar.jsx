import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link, NavLink } from 'react-router-dom'
import { BookOpen, User, LayoutDashboard, Library, LogOut, ChevronDown } from 'lucide-react'
import { setUser } from '../features/auth/authSlice'
import API from '../api/axios'

// Responsive navigation bar with auth-aware links and profile dropdown
const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Logs user out, clears Redux state, and redirects to login
  const handleLogout = async () => {
    setDropdownOpen(false)
    try {
      await API.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    dispatch(setUser(null))
    navigate('/login')
  }

  // Returns active/inactive styling for nav links
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 text-sm font-medium transition-colors ${
      isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280] hover:text-[#1E3A8A]'
    }`

  return (
    <nav className="border-b border-[#E5E7EB] bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-[#1E3A8A]" />
          <span className="text-xl font-bold text-[#1E3A8A]">EduVista</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink to="/courses" className={navLinkClass}>
              <BookOpen className="w-4 h-4" />
              All Courses
            </NavLink>
            <NavLink to="/my-courses" className={navLinkClass}>
              <Library className="w-4 h-4" />
              My Courses
            </NavLink>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1E3A8A] transition-colors cursor-pointer"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#1E3A8A]" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/my-courses"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors"
                  >
                    <Library className="w-4 h-4" />
                    My Courses
                  </Link>
                  <div className="border-t border-[#E5E7EB] my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
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
