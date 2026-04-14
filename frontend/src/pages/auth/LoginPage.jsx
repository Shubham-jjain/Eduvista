import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react'
import { setUser, setLoading, setError, clearError } from '../../features/auth/authSlice'
import API from '../../api/axios'

// Login form with email/password authentication and Redux integration
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Submits login credentials and dispatches user to Redux store
  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(setLoading(true))
    try {
      const response = await API.post('/auth/login', { email, password })
      dispatch(setUser(response.data.user))
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Login failed'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="min-h-screen bg-white flex font-sans">
      {/* Left Panel — Branding with decorative geometry */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0" aria-hidden="true">
          <div
            className="animate-fade-in absolute top-16 right-16 w-64 h-64 rounded-full bg-white/5"
            style={{ animationDelay: '200ms' }}
          />
          <div
            className="animate-fade-in animate-spin-slow absolute -bottom-10 -left-10 w-40 h-40 rounded-full border-2 border-dashed border-white/15"
            style={{ animationDelay: '400ms', animationDuration: '0.6s, 20s' }}
          />
          <div
            className="animate-fade-in animate-float absolute top-1/4 right-1/4 w-10 h-10 rounded-full bg-[#DBEAFE]/20"
            style={{ animationDelay: '500ms', animationDuration: '0.6s, 6s' }}
          />
          <div
            className="animate-fade-in absolute bottom-1/3 right-20 w-4 h-4 rounded-full bg-white/20"
            style={{ animationDelay: '600ms' }}
          />
          <div
            className="animate-fade-in absolute top-1/3 left-16 w-16 h-0.5 bg-white/10 rotate-[-25deg]"
            style={{ animationDelay: '700ms' }}
          />
          <div
            className="animate-fade-in absolute top-[38%] left-20 w-10 h-0.5 bg-white/10 rotate-[-25deg]"
            style={{ animationDelay: '750ms' }}
          />
        </div>

        {/* Panel content */}
        <div className="max-w-md text-white relative z-10">
          <div
            className="animate-slide-in-left flex items-center gap-3 mb-10"
            style={{ animationDelay: '100ms' }}
          >
            <BookOpen className="w-9 h-9" />
            <span className="font-serif text-2xl">EduVista</span>
          </div>
          <h1
            className="animate-slide-in-left font-serif text-4xl xl:text-5xl leading-tight mb-5"
            style={{ animationDelay: '250ms' }}
          >
            Welcome back!
          </h1>
          <p
            className="animate-slide-in-left text-lg text-[#BFDBFE] leading-relaxed"
            style={{ animationDelay: '400ms' }}
          >
            Continue your learning journey. Access thousands of courses from expert instructors.
          </p>
          {/* Trust stats */}
          <div
            className="animate-slide-in-left flex gap-8 mt-12 pt-8 border-t border-white/15"
            style={{ animationDelay: '550ms' }}
          >
            {[{ value: '500+', label: 'Courses' }, { value: '25K+', label: 'Students' }, { value: '120+', label: 'Instructors' }].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl text-white">{stat.value}</p>
                <p className="text-xs text-[#BFDBFE] uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div
            className="animate-fade-in flex items-center gap-2 mb-10 lg:hidden"
            style={{ animationDelay: '100ms' }}
          >
            <BookOpen className="w-7 h-7 text-[#1E3A8A]" />
            <span className="font-serif text-xl text-[#1E3A8A]">EduVista</span>
          </div>

          <h2
            className="animate-fade-in-up font-serif text-3xl text-[#1E3A8A] mb-2"
            style={{ animationDelay: '100ms' }}
          >
            Sign in
          </h2>
          <p
            className="animate-fade-in-up text-[#6B7280] mb-8"
            style={{ animationDelay: '200ms' }}
          >
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#2563EB] font-medium hover:underline">
              Sign up
            </Link>
          </p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div
              className="animate-fade-in-up mb-5"
              style={{ animationDelay: '300ms' }}
            >
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div
              className="animate-fade-in-up mb-5"
              style={{ animationDelay: '400ms' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#111827]">
                  Password
                </label>
                <a href="/forgot-password" className="text-xs text-[#2563EB] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-11 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div
              className="animate-fade-in-up flex items-center mb-7"
              style={{ animationDelay: '500ms' }}
            >
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-[#6B7280]">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '600ms' }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
