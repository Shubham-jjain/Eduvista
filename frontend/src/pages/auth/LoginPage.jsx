import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-10 h-10" />
            <span className="text-3xl font-bold">EduVista</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-lg text-blue-200">
            Continue your learning journey. Access thousands of courses from expert instructors.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BookOpen className="w-8 h-8 text-[#1E3A8A]" />
            <span className="text-2xl font-bold text-[#1E3A8A]">EduVista</span>
          </div>

          <h2 className="text-2xl font-bold text-[#111827] mb-1">Sign in to your account</h2>
          <p className="text-[#6B7280] mb-8">
            Don't have an account?{' '}
            <a href="/register" className="text-[#2563EB] font-medium hover:underline">
              Sign up
            </a>
          </p>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#111827]">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm text-[#2563EB] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center mb-6">
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
            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
