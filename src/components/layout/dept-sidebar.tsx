"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/admin/actions"
import { toast } from "sonner"

const NAV_ITEMS = [
  {
    icon: "dashboard",
    label: "Dashboard",
    href: "/dept/dashboard",
    description: "Overview & analytics",
    comingSoon: false,
  },
  {
    icon: "calendar_month",
    label: "Events",
    href: "/dept/events",
    description: "Manage upcoming events",
    comingSoon: false,
  },
  {
    icon: "send",
    label: "Propose Event",
    href: "/dept/propose-event",
    description: "Submit event proposals",
    comingSoon: false,
  },
  {
    icon: "qr_code_scanner",
    label: "Campus Scanner",
    href: "/dept/scanner",
    description: "QR attendance scanning",
    comingSoon: false,
  },
  {
    icon: "wifi_tethering",
    label: "Live Attendance",
    href: "/dept/attendance",
    description: "Real-time monitoring",
    comingSoon: false,
  },
  {
    icon: "bar_chart",
    label: "Reports",
    href: "/dept/reports",
    description: "Generate & export reports",
    comingSoon: false,
  },
  {
    icon: "gavel",
    label: "Penalties",
    href: "/dept/penalties",
    description: "Manage student penalties",
    comingSoon: false,
  },
  {
    icon: "settings",
    label: "Settings",
    href: "/dept/settings",
    description: "System configuration",
    comingSoon: false,
  },
]

interface DeptSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  session: any
  department: any
}

export function DeptSidebar({ mobileOpen, onMobileClose, session, department }: DeptSidebarProps) {
  const pathname = usePathname()
  const deptColor = department?.color || "#3B82F6"

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
    if (onMobileClose) onMobileClose()
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1E45] overflow-hidden">
      {/* Top logo area */}
      <div className="p-7 pb-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          {/* Logo mark */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${deptColor}, #1D4ED8)`,
              boxShadow: `0 4px 15px ${deptColor}40`
            }}
          >
            <span className="material-symbols-outlined text-white text-[22px] [font-variation-settings:'FILL'_1]">
              qr_code_2
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white font-extrabold text-[18px] tracking-tight leading-none">
              QRVents
            </div>
            <div className="text-white/90 text-[10px] font-extrabold mt-1 tracking-widest uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              {department?.code || "DEPT"} ADMIN
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2.5">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: deptColor }}
          >
            <span className="text-white font-bold text-sm">
              {session?.fullName?.charAt(0) || "D"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              {session?.fullName}
            </div>
            <div className="text-blue-200 text-[11px] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              {department?.name}
            </div>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-[0_0_6px_#22C55E]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-none">
        <div className="mb-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href + "/"))
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
                  <span
                    className={`material-symbols-outlined text-[18px] transition-colors ${
                      isActive ? "text-white [font-variation-settings:'FILL'_1]" : "text-blue-200 [font-variation-settings:'FILL'_0]"
                    } group-hover:text-white`}
                  >
                    {item.icon}
                  </span>
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
        <form action={logoutAction}>
          <button
            type="submit"
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
        </form>
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
    </>
  )
}
