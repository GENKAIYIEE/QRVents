"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  CalendarPlus,
  Send,
  QrCode,
  Radio,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function DeptAdminSidebar({ session, department }: { session: any; department: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dept/dashboard", icon: LayoutDashboard, active: true },
    { name: "Event", href: "#", icon: CalendarPlus, active: false, comingSoon: true },
    { name: "Propose Event", href: "#", icon: Send, active: false, comingSoon: true },
    { name: "Campus Scanner", href: "#", icon: QrCode, active: false, comingSoon: true },
    { name: "Live Attendance", href: "#", icon: Radio, active: false, comingSoon: true },
    { name: "Reports", href: "#", icon: BarChart2, active: false, comingSoon: true },
    { name: "Settings", href: "#", icon: Settings, active: false, comingSoon: true },
  ]

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-sm border border-slate-200"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">QRVents</span>
          </div>

          <div
            className="px-4 py-3 rounded-lg mb-6 border"
            style={{
              backgroundColor: department.lightBg,
              borderColor: `${department.color}20`,
            }}
          >
            <div
              className="text-xs font-bold uppercase tracking-wider mb-1"
              style={{ color: department.color }}
            >
              Department
            </div>
            <div className="text-sm font-semibold text-slate-800 line-clamp-1">
              {department.name}
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <div key={item.name} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: department.lightBg }}
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Link
                    href={item.href}
                    onClick={item.comingSoon ? handleComingSoon : undefined}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon
                      size={18}
                      style={{ color: isActive ? department.color : "inherit" }}
                    />
                    {item.name}
                    {item.comingSoon && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                  </Link>
                </div>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: department.color }}
            >
              {getInitials(session.fullName)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {session.fullName}
              </div>
              <div className="text-xs text-slate-500 truncate">Dept Admin</div>
            </div>
          </div>
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
