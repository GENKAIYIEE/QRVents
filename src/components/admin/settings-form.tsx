"use client"

import { useState } from "react"
import { updateProfile, changePassword } from "@/app/admin/settings/actions"

interface SettingsFormProps {
  user: {
    id: string
    fullName: string
    email: string
    role: string
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  // Profile State
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false)
  const [securitySuccess, setSecuritySuccess] = useState(false)
  const [securityError, setSecurityError] = useState("")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileSubmitting(true)
    setProfileSuccess(false)
    try {
      await updateProfile({ fullName, email })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setIsProfileSubmitting(false)
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
      await changePassword(currentPassword, newPassword)
      setSecuritySuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSecuritySuccess(false), 3000)
    } catch (err: any) {
      setSecurityError(err.message || "Failed to change password")
    } finally {
      setIsSecuritySubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl w-full mx-auto space-y-12">
      
      {/* Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 [font-variation-settings:'FILL'_1]">person</span>
              Profile Information
            </h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
              Update your personal details and how you appear across the system. 
              Your role dictates your access level and cannot be changed here.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 md:p-8 space-y-6">
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
              <label className="block text-sm font-bold text-slate-700 mb-2">System Role</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">admin_panel_settings</span>
                <input 
                  type="text" 
                  value={user.role.replace("_", " ")}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed uppercase tracking-wider text-sm"
                />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="h-6">
                {profileSuccess && (
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Profile updated successfully
                  </span>
                )}
              </div>
              <button 
                type="submit"
                disabled={isProfileSubmitting || (fullName === user.fullName && email === user.email)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-blue-200 flex items-center gap-2"
              >
                {isProfileSubmitting ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-slate-100"></div>

      {/* Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-1">
          <div className="sticky top-6">
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
  )
}
