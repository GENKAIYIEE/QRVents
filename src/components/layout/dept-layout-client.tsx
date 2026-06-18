"use client"

import { useState } from "react"
import { DeptSidebar } from "@/components/layout/dept-sidebar"

interface DeptLayoutClientProps {
  children: React.ReactNode
  session: any
  department: any
}

export function DeptLayoutClient({ children, session, department }: DeptLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const deptColor = department?.color || "#3B82F6"

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DeptSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        session={session}
        department={department}
      />

      {/* Main content area — offset by sidebar width on md+ */}
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen transition-all duration-300 relative z-10 w-full overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 h-20 flex items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">
              menu
            </span>
          </button>

          {/* Page breadcrumb / title area */}
          <div className="flex-1 min-w-0 flex flex-col hidden sm:flex">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]" style={{ color: deptColor }}>
                verified_user
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                {department?.code} Portal
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">
                Dashboard Overview
              </h1>
            </div>
          </div>

          <div className="flex-1 flex sm:hidden">
             {/* Mobile title fallback */}
             <h1 className="text-lg font-extrabold text-slate-900 tracking-tight m-0 truncate">
                Dashboard
             </h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Notification bell */}
            <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm relative group">
              <span className="material-symbols-outlined text-slate-500 text-[22px] group-hover:text-blue-600 transition-colors">
                notifications
              </span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Admin avatar */}
            <div className="flex items-center gap-3 p-1 pl-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-900 whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis leading-tight">
                  {session?.fullName}
                </div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Dept Admin
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ 
                  background: `linear-gradient(135deg, ${deptColor}, #1D4ED8)`,
                }}
              >
                <span className="text-white font-bold text-sm">
                  {session?.fullName?.charAt(0) || "D"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden max-w-[100vw] md:max-w-none">
          {children}
        </main>
      </div>
    </div>
  )
}
