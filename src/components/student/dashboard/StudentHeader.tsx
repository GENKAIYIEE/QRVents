"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { Menu, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { logoutAction } from "@/app/admin/actions"
import { StudentNotifications } from "./StudentNotifications"

interface StudentHeaderProps {
  session: any
  department: any
  studentUser: any
  onMenuClick: () => void
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string; icon: string }> = {
  "/student/dashboard": {
    title: "Dashboard",
    subtitle: "Welcome back to your student portal",
    icon: "dashboard",
  },
  "/student/events": {
    title: "Events",
    subtitle: "Discover upcoming campus activities",
    icon: "calendar_month",
  },
  "/student/attendance-history": {
    title: "Attendance History",
    subtitle: "Track your event participations",
    icon: "history",
  },
  "/student/qr-code": {
    title: "My QR Code",
    subtitle: "Your digital pass for events",
    icon: "qr_code_2",
  },
  "/student/penalties": {
    title: "Penalties",
    subtitle: "View your current standing",
    icon: "warning",
  },

  "/student/profile": {
    title: "Profile",
    subtitle: "Your student information",
    icon: "person",
  },
  "/student/notifications": {
    title: "Notifications",
    subtitle: "Recent updates and alerts",
    icon: "notifications",
  },
}

function getPageInfo(pathname: string, formattedName: string) {
  if (pathname === "/student/dashboard") {
    return {
      title: "Dashboard",
      subtitle: `Welcome back, ${formattedName}! Here are your upcoming events.`,
      icon: "dashboard"
    }
  }
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  for (const [key, value] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + "/")) return value
  }
  return { title: "Student Portal", subtitle: "QRVents portal", icon: "school" }
}

export function StudentHeader({ session, department, studentUser, onMenuClick }: StudentHeaderProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const deptColor = department?.color || "#3B82F6"
  const deptLightBg = department?.lightBg || "#EFF6FF"
  
  const formattedName = session?.fullName 
    ? session.fullName.charAt(0).toUpperCase() + session.fullName.split(" ")[0].slice(1).toLowerCase() 
    : ""

  const pageInfo = getPageInfo(pathname, formattedName)

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 h-[72px] flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>

      {/* Page title area — desktop */}
      <div className="flex-1 min-w-0 hidden sm:flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-blue-500">
            school
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Student Portal
          </span>
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="material-symbols-outlined text-[20px] text-slate-400 [font-variation-settings:'FILL'_1]">
            {pageInfo.icon}
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0 leading-tight">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Mobile title */}
      <div className="flex-1 flex sm:hidden">
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight m-0 truncate">
          {pageInfo.title}
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Live clock */}
        <div className="hidden lg:block text-[13px] font-semibold text-slate-600 tracking-tight mr-2">
          {mounted ? format(time, "EEEE, MMMM d, yyyy · h:mm:ss a") : "Loading clock..."}
        </div>

        {/* Dept Badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-slate-100"
          style={{ background: deptLightBg, color: deptColor }}
        >
          <div className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ background: deptColor }} />
          {department?.code || "No Dept"} · {studentUser?.yearLevel || "N/A"}
        </div>
        
        <StudentNotifications />



      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowLogoutModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="material-symbols-outlined text-[32px]">logout</span>
            </div>
            <h3 className="text-xl font-extrabold text-center text-slate-900 mb-2">Sign Out</h3>
            <p className="text-center text-slate-500 font-medium mb-8">
              Are you sure you want to end your current session?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                type="button"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <form action={logoutAction} className="flex-1">
                <button 
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
