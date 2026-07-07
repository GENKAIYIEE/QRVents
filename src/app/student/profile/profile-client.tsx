"use client"

import { useState } from "react"
import { updateStudentProfile, changePassword } from "./actions"

interface ProfileClientProps {
  user: {
    id: string
    fullName: string
    email: string
    role: string
    studentId?: string | null
    yearLevel?: string | null
    department?: { name: string, code: string } | null
  }
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [yearLevel, setYearLevel] = useState(user.yearLevel || "")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Security State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)
  const [securityError, setSecurityError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)
    setError("")
    
    try {
      await updateStudentProfile({ 
        fullName, 
        email, 
        yearLevel: yearLevel.trim() === "" ? null : yearLevel 
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSecurityError("")
    setSecuritySuccess(false)
    
    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match")
      return
    }
    
    if (newPassword.length < 6) {
      setSecurityError("Password must be at least 6 characters")
      return
    }
    
    setIsSecuritySubmitting(true)
    try {
      await changePassword(newPassword)
      setSecuritySuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSecuritySuccess(false), 3000)
    } catch (err: any) {
      setSecurityError(err.message || "Failed to change password")
    } finally {
      setIsSecuritySubmitting(false)
    }
  }

  const isDirty = fullName !== user.fullName || email !== user.email || yearLevel !== (user.yearLevel || "")

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Account</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Student Profile</h1>
      </div>

      <div className="max-w-6xl w-full mx-auto space-y-12">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 [font-variation-settings:'FILL'_1]">person</span>
                Personal Information
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
                Update your personal details. This information is visible to your department admins when you check into events.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-2 animate-in shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Year Level</label>
                <select 
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800 cursor-pointer appearance-none"
                >
                  <option value="">Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="h-6">
                  {success && (
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Profile updated successfully
                    </span>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-blue-200 flex items-center gap-2"
                >
                  {isSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100"></div>

        {/* Academic Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-1">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-500 [font-variation-settings:'FILL'_1]">school</span>
                Academic Details
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
                Your department assignment is permanently locked. If you shifted to a different department, please contact your Department Admin.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">corporate_fare</span>
                  <input 
                    type="text" 
                    value={user.department?.name || "No Department"}
                    disabled
                    className="w-full pl-12 pr-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed uppercase tracking-wider text-[11px]"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100"></div>

        {/* Security Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-1">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500 [font-variation-settings:'FILL'_1]">lock</span>
                Security & Password
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
                Ensure your account is using a long, random password to stay secure. Minimum of 6 characters required.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSecuritySubmit} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
              {securityError && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-2 animate-in shake">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {securityError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="h-6">
                  {securitySuccess && (
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Password secured successfully
                    </span>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSecuritySubmitting || !newPassword || !confirmPassword}
                  className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5 shadow-sm flex items-center gap-2"
                >
                  {isSecuritySubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
