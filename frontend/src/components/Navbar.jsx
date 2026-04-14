import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link, NavLink } from 'react-router-dom'
import { BookOpen, User, LayoutDashboard, Library, LogOut, ChevronDown, Menu, X } from 'lucide-react'
import { setUser } from '../features/auth/authSlice'
import API from '../api/axios'

// Responsive navigation bar with auth-aware links, profile dropdown, and mobile menu
const Navbar = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Closes dropdown when clicking outside
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
    setMobileMenuOpen(false)
    try {
      await API.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
    dispatch(setUser(null))
    navigate('/login')
  }

  // Returns active/inactive styling for desktop nav links
  const navLinkClass = ({ isActive }) =>
    `relative flex items-center gap-1.5 text-sm font-medium transition-all duration-200 py-1 ${
      isActive
        ? 'text-[#1E3A8A] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#2563EB] after:rounded-full'
        : 'text-[#6B7280] hover:text-[#1E3A8A]'
    }`

  // Returns active/inactive styling for mobile nav links
  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? 'text-[#1E3A8A] bg-[#DBEAFE]'
        : 'text-[#6B7280] hover:text-[#1E3A8A] hover:bg-[#F9FAFB]'
    }`

  return (
    <nav className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-7 h-7 text-[#1E3A8A] transition-transform duration-300 group-hover:scale-110" />
          <span className="font-serif text-xl text-[#1E3A8A]">EduVista</span>
        </Link>

        {user ? (
          <>
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
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
                  className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1E3A8A] transition-all duration-200 cursor-pointer"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent hover:ring-[#DBEAFE] transition-all duration-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center ring-2 ring-transparent hover:ring-[#2563EB]/20 transition-all duration-200">
                      <User className="w-4 h-4 text-[#1E3A8A]" />
                    </div>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="animate-fade-in absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 py-1.5 origin-top-right">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors duration-150 rounded-lg mx-1"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors duration-150 rounded-lg mx-1"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/my-courses"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#DBEAFE] transition-colors duration-150 rounded-lg mx-1"
                    >
                      <Library className="w-4 h-4" />
                      My Courses
                    </Link>
                    <div className="border-t border-[#E5E7EB] my-1.5 mx-3" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full cursor-pointer rounded-lg mx-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-[#6B7280] hover:text-[#1E3A8A] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#2563EB] transition-all duration-300 active:scale-[0.98] text-sm"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden animate-fade-in border-t border-[#E5E7EB] bg-white px-4 py-3 space-y-1">
          <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </NavLink>
          <NavLink to="/courses" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <BookOpen className="w-4.5 h-4.5" />
            All Courses
          </NavLink>
          <NavLink to="/my-courses" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <Library className="w-4.5 h-4.5" />
            My Courses
          </NavLink>
          <NavLink to="/profile" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
            <User className="w-4.5 h-4.5" />
            Profile
          </NavLink>
          <div className="border-t border-[#E5E7EB] my-2" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
