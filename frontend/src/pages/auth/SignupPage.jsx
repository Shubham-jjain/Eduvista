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

  // Shared left panel with decorative elements
  const LeftPanel = ({ title, subtitle }) => (
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
          {title}
        </h1>
        <p
          className="animate-slide-in-left text-lg text-[#BFDBFE] leading-relaxed"
          style={{ animationDelay: '400ms' }}
        >
          {subtitle}
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
  )

  // Loading spinner for submit buttons
  const Spinner = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  // OTP Verification Screen
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-white flex font-sans">
        <LeftPanel
          title="Almost there!"
          subtitle="Check your email for the verification code to complete your registration."
        />

        {/* Right Panel — OTP Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <button
              onClick={() => setStep('form')}
              className="animate-fade-in flex items-center gap-1 text-[#6B7280] hover:text-[#111827] text-sm mb-8 cursor-pointer transition-colors"
              style={{ animationDelay: '100ms' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div
              className="animate-fade-in flex items-center gap-2 mb-2 lg:hidden"
              style={{ animationDelay: '100ms' }}
            >
              <BookOpen className="w-7 h-7 text-[#1E3A8A]" />
              <span className="font-serif text-xl text-[#1E3A8A]">EduVista</span>
            </div>

            <h2
              className="animate-fade-in-up font-serif text-3xl text-[#1E3A8A] mb-2"
              style={{ animationDelay: '150ms' }}
            >
              Verify your email
            </h2>
            <p
              className="animate-fade-in-up text-[#6B7280] mb-8"
              style={{ animationDelay: '250ms' }}
            >
              We sent a 6-digit code to <strong className="text-[#111827]">{email}</strong>
            </p>

            {otpError && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in">
                {otpError}
              </div>
            )}

            {/* OTP Input Boxes */}
            <div
              className="animate-fade-in-up flex gap-3 justify-center mb-8"
              style={{ animationDelay: '350ms' }}
            >
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
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all duration-200"
                />
              ))}
            </div>

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: '450ms' }}
            >
              <button
                onClick={handleVerify}
                disabled={otpLoading}
                className="w-full bg-[#1E3A8A] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#2563EB] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mb-4"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Verifying...
                  </span>
                ) : 'Verify Email'}
              </button>
            </div>

            <p
              className="animate-fade-in-up text-center text-sm text-[#6B7280]"
              style={{ animationDelay: '550ms' }}
            >
              Didn&apos;t receive the code?{' '}
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
    <div className="min-h-screen bg-white flex font-sans">
      <LeftPanel
        title="Join EduVista!"
        subtitle="Start your learning journey today. Access thousands of courses from expert instructors."
      />

      {/* Right Panel — Signup Form */}
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
            Create your account
          </h2>
          <p
            className="animate-fade-in-up text-[#6B7280] mb-8"
            style={{ animationDelay: '200ms' }}
          >
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {displayError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm animate-fade-in">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div
              className="animate-fade-in-up mb-5"
              style={{ animationDelay: '250ms' }}
            >
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Full name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div
              className="animate-fade-in-up mb-5"
              style={{ animationDelay: '320ms' }}
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
              className="animate-fade-in-up mb-3"
              style={{ animationDelay: '390ms' }}
            >
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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

            {/* Password Rules */}
            {password && (
              <div className="mb-5 space-y-1.5 animate-fade-in">
                {rules.map((rule, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-200 ${rule.passed ? 'bg-green-100' : 'bg-[#F3F4F6]'}`}>
                      {rule.passed ? (
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      ) : (
                        <X className="w-2.5 h-2.5 text-[#9CA3AF]" />
                      )}
                    </div>
                    <span className={`text-xs transition-colors duration-200 ${rule.passed ? 'text-green-600' : 'text-[#6B7280]'}`}>
                      {rule.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div
              className="animate-fade-in-up mb-5"
              style={{ animationDelay: '460ms' }}
            >
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                Confirm password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#6B7280] transition-colors group-focus-within:text-[#2563EB]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200"
                />
              </div>
            </div>

            {/* Role */}
            <div
              className="animate-fade-in-up mb-7"
              style={{ animationDelay: '530ms' }}
            >
              <label className="block text-sm font-medium text-[#111827] mb-1.5">
                I want to
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all duration-200 cursor-pointer"
              >
                <option value="student">Learn (Student)</option>
                <option value="instructor">Teach (Instructor)</option>
              </select>
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
                    <Spinner />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
