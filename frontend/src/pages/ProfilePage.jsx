import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { User, Mail, Camera, Pencil, Save, X, Loader2, Tag, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Check } from "lucide-react"
import { setUser } from "../features/auth/authSlice"
import API from "../api/axios"
import Navbar from "../components/Navbar"

// Password rule checker returning pass/fail for each requirement
const getPasswordRules = (password) => [
  { label: "At least 8 characters", passed: password.length >= 8 },
  { label: "At least 1 letter", passed: /[a-zA-Z]/.test(password) },
  { label: "At least 1 number", passed: /\d/.test(password) },
  { label: "At least 1 special character", passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
]

// User profile page with image upload, editable bio/expertise, and password change
const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [expertise, setExpertise] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  useEffect(() => {
    setName(user?.name || "")
    setBio(user?.bio || "")
    setExpertise(user?.expertise?.join(", ") || "")
    setImagePreview(user?.profileImage || null)
  }, [user])

  // Saves updated profile fields to backend
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await API.put("/user/profile", { name, bio, expertise })
      dispatch(setUser(res.data.user))
      setSuccess("Profile updated successfully")
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  // Validates selected image file and shows preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // Uploads selected image to backend via FormData
  const handleImageUpload = async () => {
    if (!imageFile) return

    setImageLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("profileImage", imageFile)
      const res = await API.put("/user/profile/image", formData)
      dispatch(setUser(res.data.user))
      setImageFile(null)
      setSuccess("Profile image updated successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload image")
      setImagePreview(user?.profileImage || null)
    } finally {
      setImageLoading(false)
    }
  }

  // Resets image preview to current profile image
  const handleCancelImage = () => {
    setImageFile(null)
    setImagePreview(user?.profileImage || null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Discards profile edits and restores original values
  const handleCancelEdit = () => {
    setIsEditing(false)
    setName(user?.name || "")
    setBio(user?.bio || "")
    setExpertise(user?.expertise?.join(", ") || "")
    setError(null)
  }

  const passwordRules = getPasswordRules(newPassword)
  const allRulesPassed = passwordRules.every((r) => r.passed)

  // Validates and submits password change to backend
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (!allRulesPassed) {
      setPasswordError("New password does not meet all requirements")
      return
    }

    setPasswordLoading(true)
    try {
      const res = await API.put("/user/profile/password", { oldPassword, newPassword })
      setPasswordSuccess(res.data.message)
      setOldPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        {success && (
          <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="border border-[#E5E7EB] rounded-lg p-8">
          {/* Profile Image + Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            {/* Image Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={user.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-[#E5E7EB]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-[#DBEAFE] flex items-center justify-center border-2 border-[#E5E7EB]">
                    <User className="w-12 h-12 text-[#1E3A8A]" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {imageFile ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImageUpload}
                    disabled={imageLoading}
                    className="flex items-center gap-1 text-sm font-medium text-white bg-[#2563EB] px-3 py-1.5 rounded-lg hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {imageLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Upload
                  </button>
                  <button
                    onClick={handleCancelImage}
                    className="flex items-center gap-1 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Change Photo
                </button>
              )}
            </div>

            {/* Name, Email, Role */}
            <div className="flex-1 text-center sm:text-left sm:pt-2">
              <h1 className="text-2xl font-bold text-[#111827]">{user.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-[#6B7280] text-sm">
                <Mail className="w-4 h-4" />
                {user.email}
              </div>
              <span className="inline-block mt-3 px-3 py-1 bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium rounded-full capitalize">
                {user.role}
              </span>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] my-6" />

          {/* Profile Details */}
          {isEditing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none resize-none"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">{bio.length}/500</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    Expertise
                  </label>
                  <input
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. React, Node.js, Python"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Separate skills with commas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 border border-[#E5E7EB] text-[#6B7280] px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#111827]">About</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1E3A8A] transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-[#6B7280] mb-1">Bio</h3>
                <p className="text-sm text-[#111827]">
                  {user.bio || "No bio added yet."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#6B7280] mb-2 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  Expertise
                </h3>
                {user.expertise?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B7280]">No expertise added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Change Password Section */}
        <div className="border border-[#E5E7EB] rounded-lg mt-6">
          <button
            onClick={() => {
              setShowPasswordSection(!showPasswordSection)
              setPasswordError(null)
              setPasswordSuccess(null)
            }}
            className="w-full flex items-center justify-between p-6 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#6B7280]" />
              <h2 className="text-lg font-bold text-[#111827]">Change Password</h2>
            </div>
            {showPasswordSection ? (
              <ChevronUp className="w-5 h-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6B7280]" />
            )}
          </button>

          {showPasswordSection && (
            <div className="px-6 pb-6">
              {passwordSuccess && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    Current password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#111827]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Rules */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      {passwordRules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {rule.passed ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-400" />
                          )}
                          <span className={`text-xs ${rule.passed ? "text-green-600" : "text-[#6B7280]"}`}>
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1.5">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-[#111827] text-sm focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1E3A8A] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  Change Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
