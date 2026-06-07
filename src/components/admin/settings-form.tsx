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
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile")
  
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-w-4xl">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors relative ${
            activeTab === "profile" ? "text-blue-600" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Profile Information
          {activeTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors relative ${
            activeTab === "security" ? "text-blue-600" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          Security
          {activeTab === "security" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
              <input 
                type="text" 
                value={user.role}
                disabled
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed uppercase"
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button 
                type="submit"
                disabled={isProfileSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isProfileSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                Save Changes
              </button>
              {profileSuccess && <span className="text-sm font-semibold text-emerald-600 animate-in fade-in">Profile updated!</span>}
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSecuritySubmit} className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
            {securityError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
                {securityError}
              </div>
            )}
            
            {/* Note: current password verification disabled for simplicity */}
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button 
                type="submit"
                disabled={isSecuritySubmitting}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
              >
                {isSecuritySubmitting ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                Update Password
              </button>
              {securitySuccess && <span className="text-sm font-semibold text-emerald-600 animate-in fade-in">Password updated!</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
