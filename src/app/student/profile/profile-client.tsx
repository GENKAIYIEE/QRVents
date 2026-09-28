"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateStudentProfile, changePassword } from "./actions"
import { useSearchParams, useRouter } from "next/navigation"

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  yearLevel: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileClientProps {
  user: {
    id: string
    fullName: string
    email: string
    role: string
    studentId?: string | null
    yearLevel?: string | null
    section?: string | null
    department?: { name: string, code: string, sections?: string[] } | null
  }
}

export function ProfileClient({ user }: ProfileClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requireSectionUpdate = searchParams.get("updateSection") === "1"

  const deptSections = user.department?.sections ?? []
  const hasDeptSections = deptSections.length > 0

  // Section & Year update state for modal
  const [selectedYearLevel, setSelectedYearLevel] = useState(user.yearLevel || "")
  const [selectedSection, setSelectedSection] = useState("")
  const [isSectionSubmitting, setIsSectionSubmitting] = useState(false)
  const [sectionError, setSectionError] = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      yearLevel: user.yearLevel || "",
    }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Security State
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)
  const [securityError, setSecurityError] = useState("")

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setIsSubmitting(true)
    setSuccess(false)
    setError("")
    
    try {
      await updateStudentProfile({ 
        fullName: values.fullName, 
        email: values.email, 
        yearLevel: values.yearLevel?.trim() === "" ? null : values.yearLevel 
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

  const handleSectionUpdate = async () => {
    if (!selectedSection) {
      setSectionError("Please select a section.")
      return
    }
    if (!selectedYearLevel) {
      setSectionError("Please select your year level.")
      return
    }
    setIsSectionSubmitting(true)
    setSectionError("")
    try {
      await updateStudentProfile({
        fullName: user.fullName,
        email: user.email,
        section: selectedSection,
        yearLevel: selectedYearLevel,
      })
      // Redirect to dashboard after successful update
      router.push("/student/dashboard")
    } catch (err: any) {
      setSectionError(err.message || "Failed to update section.")
    } finally {
      setIsSectionSubmitting(false)
    }
  }

  const watchFullName = watch("fullName")
  const watchEmail = watch("email")
  const watchYearLevel = watch("yearLevel")
  const isDirty = watchFullName !== user.fullName || watchEmail !== user.email || watchYearLevel !== (user.yearLevel || "")

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">

      {/* ── FORCED SECTION UPDATE MODAL ── */}
      {requireSectionUpdate && hasDeptSections && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Update Required</h2>
                <p className="text-sm text-slate-500 mt-0.5">Your department has updated its sections</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 mb-6">
              <p>
                Your current section {user.section ? (<strong>&quot;{user.section}&quot;</strong>) : "(not set)"} is no longer valid. 
                Please verify your Year Level and select your correct section below to continue.
              </p>
            </div>

            {sectionError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-sm font-bold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {sectionError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-700 mb-2">Year Level</label>
              <select
                value={selectedYearLevel}
                onChange={(e) => {
                  setSelectedYearLevel(e.target.value)
                  setSelectedSection("") // Reset section when year level changes
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800 appearance-none"
              >
                <option value="" disabled>Select Year Level</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedYearLevel}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>{selectedYearLevel ? "Choose section…" : "Select Year Level First"}</option>
                {(() => {
                  // New format: letter prefix determines year. A=1st, B=2nd, C=3rd, D=4th
                  const YEAR_TO_LETTER: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D" }
                  const letterPrefix = YEAR_TO_LETTER[selectedYearLevel] ?? ""
                  return deptSections
                    .filter((sec) => letterPrefix ? sec.toUpperCase().startsWith(letterPrefix) : true)
                    .map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))
                })()}
              </select>
            </div>

            <button
              onClick={handleSectionUpdate}
              disabled={isSectionSubmitting || !selectedSection || !selectedYearLevel}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSectionSubmitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              Update & Continue
            </button>

            <p className="text-xs text-slate-400 mt-4 text-center">
              You cannot access the dashboard until your section is updated.
            </p>
          </div>
        </div>
      )}

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
            <form onSubmit={handleSubmit(onSubmitProfile)} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
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
                    {...register("fullName")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                  {errors.fullName && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.fullName.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    {...register("email")}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800"
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Year Level</label>
                <select 
                  {...register("yearLevel")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-800 cursor-pointer appearance-none"
                >
                  <option value="">Select Year Level</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.yearLevel && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.yearLevel.message}</p>}
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

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Section</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">groups</span>
                  <input 
                    type="text" 
                    value={user.section || "Not Set"}
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
