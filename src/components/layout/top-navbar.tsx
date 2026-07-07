"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { logoutAction } from "@/app/admin/actions"

interface TopNavbarProps {
  session: {
    fullName: string
    email: string
    role: string
  } | null
  onMobileMenuOpen?: () => void
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string; icon: string }> = {
  "/admin/dashboard": {
    title: "Dashboard Overview",
    subtitle: "System metrics and active event status",
    icon: "dashboard",
  },
  "/admin/events": {
    title: "Events",
    subtitle: "Create & manage events",
    icon: "calendar_month",
  },
  "/admin/proposals": {
    title: "Event Proposals",
    subtitle: "Review department proposals",
    icon: "assignment",
  },
  "/admin/scanner": {
    title: "Campus Scanner",
    subtitle: "QR attendance scanning",
    icon: "qr_code_scanner",
  },
  "/admin/attendance": {
    title: "Live Attendance",
    subtitle: "Real-time monitoring",
    icon: "wifi_tethering",
  },
  "/admin/dept-admins": {
    title: "Dept Admins",
    subtitle: "Register department deans",
    icon: "manage_accounts",
  },
  "/admin/reports": {
    title: "Reports",
    subtitle: "Generate & export reports",
    icon: "bar_chart",
  },
  "/admin/settings": {
    title: "Settings",
    subtitle: "System configuration",
    icon: "settings",
  },
  "/admin/activity": {
    title: "Activity Log",
    subtitle: "System audit logs",
    icon: "manage_search",
  },
}

function getPageInfo(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  for (const [key, value] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + "/")) return value
  }
  return { title: "Admin Portal", subtitle: "QRVents management", icon: "admin_panel_settings" }
}

export function TopNavbar({ session, onMobileMenuOpen }: TopNavbarProps) {
  const pathname = usePathname()
  const pageInfo = getPageInfo(pathname)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const initials = session?.fullName
    ? session.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SA"

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 h-[72px] flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
        onClick={onMobileMenuOpen}
      >
        <span className="material-symbols-outlined text-[24px]">
          menu
        </span>
      </button>

      {/* Page title area — desktop */}
      <div className="flex-1 min-w-0 hidden sm:flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-blue-500">
            shield_person
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            Super Admin
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
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-colors shadow-sm relative group ${isNotifOpen ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          >
            <span className={`material-symbols-outlined text-[22px] transition-colors ${isNotifOpen ? 'text-blue-600 [font-variation-settings:\'FILL\'_1]' : 'text-slate-500 group-hover:text-blue-600'}`}>
              notifications
            </span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800">Notifications</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">2 New</span>
              </div>
              <div className="flex flex-col max-h-[300px] overflow-y-auto">
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start relative group">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">New event proposal</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">BSIT proposed "Tech Symposium 2026". Review required.</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">10 mins ago</div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start relative group">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">Scanner Alert</div>
                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">Multiple duplicate scans detected at Main Gate.</div>
                    <div className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">2 hours ago</div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-600 leading-tight">System Update</div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">QRVents has been updated to v1.0.4 successfully.</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">1 day ago</div>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-2 pb-1 border-t border-slate-100">
                <button className="w-full py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors text-center">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin profile */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 p-1 pl-4 border rounded-2xl transition-colors cursor-pointer shadow-sm ${isProfileOpen ? 'bg-slate-100 border-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis leading-tight">
                {session?.fullName || "Admin"}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Super Admin
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-[#0F1E45] to-blue-600 shrink-0 relative overflow-hidden group">
              <span className="text-white font-bold text-sm relative z-10">
                {initials}
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-right">
              <div className="px-3 py-2 border-b border-slate-100 mb-2 md:hidden">
                <div className="text-sm font-bold text-slate-800 truncate">{session?.fullName || "Admin"}</div>
                <div className="text-xs font-medium text-slate-500">Super Admin</div>
              </div>
              
              <Link 
                href="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm group/link"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover/link:text-blue-500 transition-colors">settings</span>
                Account Settings
              </Link>
              <Link 
                href="/admin/activity"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm group/link"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover/link:text-blue-500 transition-colors">manage_search</span>
                Activity Log
              </Link>
              
              <div className="h-px bg-slate-100 my-1.5 mx-2" />
              
              <form action={logoutAction}>
                <button 
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors font-bold text-sm group/btn"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover/btn:text-rose-500 transition-colors">logout</span>
                  Sign Out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
