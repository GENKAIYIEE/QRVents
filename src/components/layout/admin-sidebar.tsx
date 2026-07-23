"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/lib/auth-actions"

const NAV_ITEMS = [
  {
    icon: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Overview & analytics",
  },
  {
    icon: "calendar_month",
    label: "Events",
    href: "/admin/events",
    description: "Create & manage events",
  },
  {
    icon: "assignment",
    label: "Event Proposals",
    href: "/admin/proposals",
    description: "Review dept proposals",
  },
  {
    icon: "archive",
    label: "Archives",
    href: "/admin/archives",
    description: "Manage historical records",
  },
  {
    icon: "qr_code_scanner",
    label: "Campus Scanner",
    href: "/admin/scanner",
    description: "QR attendance scanning",
  },
  {
    icon: "wifi_tethering",
    label: "Live Attendance",
    href: "/admin/attendance",
    description: "Real-time monitoring",
  },
  {
    icon: "manage_accounts",
    label: "Dept Admins",
    href: "/admin/dept-admins",
    description: "Register department deans",
  },
  {
    icon: "groups",
    label: "Students",
    href: "/admin/students",
    description: "Manage registered students",
  },
  {
    icon: "warning",
    label: "Penalties",
    href: "/admin/penalties",
    description: "Manage student fines",
  },
  {
    icon: "bar_chart",
    label: "Reports",
    href: "/admin/reports",
    description: "Generate & export reports",
  },
  {
    icon: "settings",
    label: "Settings",
    href: "/admin/settings",
    description: "System configuration",
  },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F1E45] overflow-hidden relative shadow-[4px_0_24px_rgba(15,30,69,0.1)]">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />

      {/* Top logo area */}
      <div className="p-7 pb-5 border-b border-white/5 shrink-0 relative z-10">
        <div className="flex items-center gap-3 mb-5">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-[0_4px_15px_rgba(37,99,235,0.4)]">
            <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-[2px]" />
          </div>
          <div>
            <div className="text-white font-extrabold text-[20px] tracking-tight leading-none">
              QRVents
            </div>
            <div className="text-white/90 text-[10px] font-bold mt-1 tracking-widest uppercase">
              SUPER ADMIN
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-blue-500 rounded-full flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-white text-[18px] [font-variation-settings:'FILL'_1]">
              admin_panel_settings
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-bold truncate">System Admin</div>
            <div className="text-blue-200/70 text-[11px] truncate">admin@gmail.com</div>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full shrink-0 shadow-[0_0_6px_#22C55E]" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-none relative z-10">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-200 relative group overflow-hidden ${
                  isActive 
                    ? "bg-blue-500/15 border border-blue-400/20" 
                    : "border border-transparent hover:bg-white/5"
                }`}
              >
                {/* Active left indicator */}
                {isActive && (
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
                
                {/* Icon wrapper */}
                <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.35)]"
                    : "bg-white/5 group-hover:bg-white/10"
                }`}>
                  <span className={`material-symbols-outlined text-[18px] transition-colors ${
                    isActive ? "text-white [font-variation-settings:'FILL'_1]" : "text-blue-200/60 group-hover:text-blue-100"
                  }`}>
                    {item.icon}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className={`text-[13px] leading-tight transition-colors ${
                    isActive ? "text-white font-bold" : "text-blue-100/80 font-semibold group-hover:text-white"
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] mt-0.5 font-medium transition-colors ${
                    isActive ? "text-blue-200/90" : "text-blue-200/40 group-hover:text-blue-200/60"
                  }`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-3 pb-5 border-t border-white/5 shrink-0 relative z-10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-2.5 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/25 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="w-[34px] h-[34px] bg-red-500/10 group-hover:bg-red-500/20 rounded-[10px] flex items-center justify-center shrink-0 transition-colors">
              <span className="material-symbols-outlined text-red-500 text-[18px] group-hover:scale-110 transition-transform">
                logout
              </span>
            </div>
            <div>
              <div className="text-red-200 text-[13px] font-bold group-hover:text-red-100 transition-colors">Sign Out</div>
              <div className="text-red-400/70 text-[10px] mt-0.5 font-medium">End your session</div>
            </div>
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-[260px] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={onMobileClose} 
          />
          <aside className="relative w-[260px] h-full z-51 animate-[slideInRight_0.25s_ease-out]">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
