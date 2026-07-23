"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/lib/auth-actions"

import { toast } from "sonner"
import { LayoutDashboard, QrCode, CalendarCheck, UserCircle, Settings, AlertTriangle, Bell } from "lucide-react"

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/student/dashboard",
    description: "Overview & analytics",
    comingSoon: false,
  },
  {
    icon: QrCode,
    label: "My QR Code",
    href: "/student/qr-code",
    description: "Your permanent QR pass",
    comingSoon: false,
  },
  {
    icon: CalendarCheck,
    label: "Attendance History",
    href: "/student/attendance-history",
    description: "Events you attended",
    comingSoon: false,
  },
  {
    icon: AlertTriangle,
    label: "Penalties",
    href: "/student/penalties",
    description: "Missed mandatory events",
    comingSoon: false,
  },
  {
    icon: UserCircle,
    label: "Profile",
    href: "/student/profile",
    description: "Your student details",
  },
  {
    icon: Bell,
    label: "Inbox",
    href: "/student/notifications",
    description: "All notifications",
  },
]

interface StudentSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  session: any
  department: any
  studentUser: any
}

export function StudentSidebar({ mobileOpen, onMobileClose, session, department, studentUser }: StudentSidebarProps) {
  const pathname = usePathname()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
    if (onMobileClose) onMobileClose()
  }

  const deptColor = department?.color || "#3B82F6"

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1E45] overflow-hidden">
      {/* Top logo area */}
      <div className="p-7 pb-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
            <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-[2px]" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-[20px] tracking-tight leading-none">
              QRVents
            </div>
            <div className="text-white/90 text-[10px] font-extrabold mt-1 tracking-widest uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              STUDENT PORTAL
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-none">
        <div className="mb-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href + "/"))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.comingSoon ? handleComingSoon : onMobileClose}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl mb-0.5 transition-all duration-200 relative group overflow-hidden ${
                  item.comingSoon ? 'opacity-60' : 'opacity-100'
                } ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${deptColor}33, ${deptColor}1a)`,
                  borderColor: `${deptColor}4d`,
                  borderWidth: '1px'
                } : {
                  borderColor: 'transparent',
                  borderWidth: '1px'
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md"
                    style={{ background: `linear-gradient(180deg, ${deptColor}, #1D4ED8)` }}
                  />
                )}
                <div
                  className="w-[34px] h-[34px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${deptColor}, #1D4ED8)`,
                    boxShadow: `0 4px 12px ${deptColor}59`
                  } : {
                    background: 'rgba(255,255,255,0.05)'
                  }}
                >
                  <Icon 
                    size={18} 
                    color={isActive ? "#fff" : "#BFDBFE"} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? "" : "group-hover:text-white transition-colors"}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-[13.5px] leading-none transition-colors ${
                    isActive ? "text-white font-bold" : "text-slate-300 font-semibold group-hover:text-white"
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10.5px] mt-1 transition-colors ${
                    isActive ? "text-white/90 font-medium" : "text-blue-200/80 font-medium group-hover:text-blue-200"
                  }`}>
                    {item.description}
                  </div>
                </div>
                {item.comingSoon && (
                  <div className="text-[9px] font-extrabold text-slate-400 bg-white/10 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                    Soon
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 pb-5 border-t border-white/5 shrink-0">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center gap-2.5 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all duration-200 text-left group"
        >
            <div className="w-[34px] h-[34px] bg-red-500/20 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-red-500 text-[18px]">
                logout
              </span>
            </div>
            <div>
              <div className="text-red-200 text-[13px] font-bold group-hover:text-red-100 transition-colors">Sign Out</div>
              <div className="text-red-400 text-[10.5px] mt-0.5 font-medium group-hover:text-red-300 transition-colors">End your session</div>
            </div>
          </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[260px] z-40 hidden md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
          />
          <aside className="relative w-[260px] h-full z-51 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

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
    </>
  )
}
