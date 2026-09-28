"use client"

import { useState, useRef } from "react"
import { updateProfile, changePassword, updateSystemSettings, updateDepartmentSections } from "@/app/admin/settings/actions"
import { toast } from "sonner"
import { X, Plus } from "lucide-react"

interface SettingsFormProps {
  user: {
    id: string
    fullName: string
    email: string
    role: string
  }
  systemSettings?: {
    defaultScanDuration: number
    autoLogoutTimer: number
  }
  department?: {
    id: string
    code: string
    name: string
    sections: string[]
  }
}

export function SettingsForm({ user, systemSettings, department }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "system" | "sections">("profile")

  // Profile State
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)

  // Security State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSecuritySubmitting, setIsSecuritySubmitting] = useState(false)

  // System Settings State
  const [scanDuration, setScanDuration] = useState(systemSettings?.defaultScanDuration ?? 120)
  const [autoLogout, setAutoLogout] = useState(systemSettings?.autoLogoutTimer ?? 5)
  const [isSystemSubmitting, setIsSystemSubmitting] = useState(false)

  // Sections State (Dept Admin only)
  const [sections, setSections] = useState<string[]>(department?.sections ?? [])
  const [sectionInput, setSectionInput] = useState("")
  const [isSectionsSubmitting, setIsSectionsSubmitting] = useState(false)
  const sectionInputRef = useRef<HTMLInputElement>(null)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileSubmitting(true)
    try {
      await updateProfile({ fullName, email })
      toast.success("Profile updated successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsSecuritySubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err.message || "Failed to change password")
    } finally {
      setIsSecuritySubmitting(false)
    }
  }

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSystemSubmitting(true)
    try {
      await updateSystemSettings({ defaultScanDuration: scanDuration, autoLogoutTimer: autoLogout })
      toast.success("System settings saved")
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setIsSystemSubmitting(false)
    }
  }

  const addSection = () => {
    const val = sectionInput.trim().toUpperCase()
    if (!val) return
    if (sections.includes(val)) {
      toast.error(`"${val}" already exists`)
      return
    }
    setSections((prev) => [...prev, val])
    setSectionInput("")
    sectionInputRef.current?.focus()
  }

  const removeSection = (sec: string) => {
    setSections((prev) => prev.filter((s) => s !== sec))
  }

  const handleSectionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSection()
    }
    if (e.key === "Backspace" && sectionInput === "" && sections.length > 0) {
      setSections((prev) => prev.slice(0, -1))
    }
  }

  const handleSectionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSectionsSubmitting(true)
    try {
      await updateDepartmentSections(sections)
      toast.success("Sections updated successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to update sections")
    } finally {
      setIsSectionsSubmitting(false)
    }
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: "person" },
    { id: "security" as const, label: "Security", icon: "lock" },
    ...(user.role === "SUPER_ADMIN" ? [{ id: "system" as const, label: "System", icon: "settings" }] : []),
    ...(user.role === "DEPT_ADMIN" ? [{ id: "sections" as const, label: "Sections", icon: "groups" }] : []),
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-2">Manage your profile, security, and system preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-colors relative whitespace-nowrap ${
                activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          {/* Profile Tab */}
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
                  value={user.role.replace("_", " ")}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed uppercase"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isProfileSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <form onSubmit={handleSecuritySubmit} className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  Password Security
                </div>
                You must enter your current password to set a new one.
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
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
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSecuritySubmitting}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSecuritySubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* System Settings Tab (Super Admin only) */}
          {activeTab === "system" && user.role === "SUPER_ADMIN" && (
            <form onSubmit={handleSystemSubmit} className="max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Scanner Auto-Lock Duration (seconds)
                </label>
                <input
                  type="number"
                  min={30}
                  max={600}
                  value={scanDuration}
                  onChange={(e) => setScanDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">Scanner locks after this many seconds of inactivity.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Session Auto-Logout Timer (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={autoLogout}
                  onChange={(e) => setAutoLogout(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-slate-400 mt-1">Users are logged out after this many minutes of inactivity.</p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSystemSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSystemSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Save System Settings
                </button>
              </div>
            </form>
          )}

          {/* Sections Tab (Dept Admin only) */}
          {activeTab === "sections" && user.role === "DEPT_ADMIN" && (
            <form onSubmit={handleSectionsSubmit} className="max-w-lg space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1.5">
                  <span className="material-symbols-outlined text-[18px] text-slate-500">info</span>
                  Managing Sections for {department?.code ?? "Your Department"}
                </div>
                <p className="text-slate-600">
                  Add the official sections for your department. Students will select from this list during registration.
                  Type a section name and press{" "}
                  <kbd className="bg-slate-100 border border-slate-300 shadow-sm px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-600">Enter</kbd> to add it.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Department Sections
                </label>

                {/* Tag Input Area */}
                <div
                  className="min-h-[42px] w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900 transition-all flex flex-wrap gap-2 items-center cursor-text"
                  onClick={() => sectionInputRef.current?.focus()}
                >
                  {sections.map((sec) => (
                    <span
                      key={sec}
                      className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium px-2 py-1 rounded-md"
                    >
                      {sec}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSection(sec) }}
                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-sm p-0.5 transition-colors"
                        aria-label={`Remove ${sec}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={sectionInputRef}
                    type="text"
                    value={sectionInput}
                    onChange={(e) => setSectionInput(e.target.value)}
                    onKeyDown={handleSectionKeyDown}
                    placeholder={sections.length === 0 ? "Type a section e.g. A1, B2…" : "Add more…"}
                    className="flex-1 min-w-[140px] bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={addSection}
                    disabled={!sectionInput.trim()}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Section
                  </button>
                  {sections.length > 0 && (
                    <span className="text-xs text-slate-500">
                      {sections.length} section{sections.length !== 1 ? "s" : ""} configured
                    </span>
                  )}
                </div>

                {sections.length === 0 && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-amber-800 bg-amber-50/50 border border-amber-200 rounded-md p-3">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">warning</span>
                    <p>No sections configured yet. Students will see a free-text input during registration until you add at least one section.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Changes take effect immediately on the registration page.
                </p>
                <button
                  type="submit"
                  disabled={isSectionsSubmitting}
                  className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium text-sm transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
                >
                  {isSectionsSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
                  Save Sections
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
