"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { StudentNotifications } from "./StudentNotifications"

interface StudentHeaderProps {
  session: any
  department: any
  studentUser: any
  onMenuClick: () => void
}

export function StudentHeader({ session, department, studentUser, onMenuClick }: StudentHeaderProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const deptColor = department?.color || "#3B82F6"
  const deptLightBg = department?.lightBg || "#EFF6FF"
  
  const isDashboard = pathname === "/student/dashboard"
  const formattedName = session?.fullName 
    ? session.fullName.charAt(0).toUpperCase() + session.fullName.slice(1) 
    : ""

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 h-20 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${!isDashboard ? "md:hidden" : ""}`}>
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>

      {/* Page breadcrumb / title area */}
      <div className="flex-1 min-w-0 flex flex-col hidden sm:flex">
        {isDashboard && (
          <>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">
                Dashboard
              </h1>
            </div>
            <div className="text-[13px] font-medium text-slate-500 mt-1 truncate">
              Welcome back, {formattedName}! Here are your upcoming events.
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex sm:hidden">
         {/* Mobile title fallback */}
         {isDashboard && (
           <h1 className="text-lg font-extrabold text-slate-900 tracking-tight m-0 truncate">
              Dashboard
           </h1>
         )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        
        {/* Live clock */}
        <div className="hidden lg:block text-[13px] font-semibold text-slate-600 tracking-tight">
          {mounted ? format(time, "EEEE, MMMM d, yyyy · h:mm:ss a") : "Loading clock..."}
        </div>

        {/* Dept Badge */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
          style={{ background: deptLightBg, color: deptColor }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: deptColor }} />
          {department?.code || "No Dept"} · {studentUser?.yearLevel || "N/A"}
        </div>
        
        <StudentNotifications />
      </div>
    </header>
  )
}
