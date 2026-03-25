import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, BookOpen, User, Check, X, ArrowLeft } from 'lucide-react'
import { setUser, setLoading, setError, clearError } from '../../features/auth/authSlice'
import API from '../../api/axios'

// Password rule checker returning pass/fail for each requirement
const getPasswordRules = (password) => [
  { label: 'At least 8 characters', passed: password.length >= 8 },
  { label: 'At least 1 letter', passed: /[a-zA-Z]/.test(password) },
  { label: 'At least 1 number', passed: /\d/.test(password) },
  { label: 'At least 1 special character', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
]

// Registration form with password rules, role selection, and OTP verification
const SignupPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)

  // OTP verification state
  const [step, setStep] = useState('form') // 'form' or 'otp'
  const [userId, setUserId] = useState(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

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

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  // Validates all password rules pass
  const allRulesPassed = getPasswordRules(password).every((r) => r.passed)

  // Validates inputs, submits registration, and switches to OTP step
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError('Passwords do not match')
      return
    }

    if (!allRulesPassed) {
      setFormError('Password does not meet all requirements')
      return
    }

    dispatch(setLoading(true))
    try {
      const response = await API.post('/auth/register', { name, email, password, role })
      setUserId(response.data.userId)
      setStep('otp')
      setResendCooldown(30)
    } catch (error) {
      dispatch(setError(error.response?.data?.message || 'Registration failed'))
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Handles typing in individual OTP input boxes with auto-focus
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handles backspace in OTP inputs to move focus backward
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Handles paste into OTP fields
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || ''
    }
    setOtp(newOtp)
    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()
  }

  // Submits the OTP code for verification
  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setOtpError('Please enter the full 6-digit code')
      return
    }

    setOtpLoading(true)
    setOtpError(null)
    try {
      const response = await API.post('/auth/verify-email', { userId, code })
      dispatch(setUser(response.data.user))
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

  // Requests a new verification code
  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await API.post('/auth/resend-code', { userId })
      setOtp(['', '', '', '', '', ''])
      setOtpError(null)
      setResendCooldown(30)
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Failed to resend code')
    }
  }

  const displayError = formError || error
  const rules = getPasswordRules(password)

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] items-center justify-center p-12">
          <div className="max-w-md text-white">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-10 h-10" />
              <span className="text-3xl font-bold">EduVista</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Almost there!</h1>
            <p className="text-lg text-blue-200">
              Check your email for the verification code to complete your registration.
            </p>
          </div>
        </div>

        {/* Right Panel — OTP Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-1 text-[#6B7280] hover:text-[#111827] text-sm mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <BookOpen className="w-8 h-8 text-[#1E3A8A]" />
              <span className="text-2xl font-bold text-[#1E3A8A]">EduVista</span>
            </div>

            <h2 className="text-2xl font-bold text-[#111827] mb-1">Verify your email</h2>
            <p className="text-[#6B7280] mb-8">
              We sent a 6-digit code to <strong className="text-[#111827]">{email}</strong>
            </p>

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {otpError}
              </div>
            )}

            {/* OTP Input Boxes */}
            <div className="flex gap-3 justify-center mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              disabled={otpLoading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {otpLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <p className="text-center text-sm text-[#6B7280]">
              Didn't receive the code?{' '}
              {resendCooldown > 0 ? (
                <span className="text-[#6B7280]">Resend in {resendCooldown}s</span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-[#2563EB] font-medium hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Registration Form Screen
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1E3A8A] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-10 h-10" />
            <span className="text-3xl font-bold">EduVista</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Join EduVista!</h1>
          <p className="text-lg text-blue-200">
            Start your learning journey today. Access thousands of courses from expert instructors.
          </p>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <BookOpen className="w-8 h-8 text-[#1E3A8A]" />
            <span className="text-2xl font-bold text-[#1E3A8A]">EduVista</span>
          </div>

          <h2 className="text-2xl font-bold text-[#111827] mb-1">Create your account</h2>
          <p className="text-[#6B7280] mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-medium hover:underline">
              Login
            </Link>
          </p>

          {displayError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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

            {/* Password Rules */}
            {password && (
              <div className="mb-5 space-y-1">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {rule.passed ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className={`text-xs ${rule.passed ? 'text-green-600' : 'text-[#6B7280]'}`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                I want to
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              >
                <option value="student">Learn (Student)</option>
                <option value="instructor">Teach (Instructor)</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-medium hover:bg-[#1E3A8A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
