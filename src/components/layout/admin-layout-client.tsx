"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { TopNavbar } from "@/components/layout/top-navbar"
import { Toaster } from "sonner"

interface AdminLayoutClientProps {
  children: React.ReactNode
  session: {
    fullName: string
    email: string
    role: string
  } | null
}

export function AdminLayoutClient({ children, session }: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Toaster position="bottom-right" richColors theme="light" />
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative md:ml-[260px]">
        {/* Top Header/Navbar */}
        <TopNavbar session={session} onMobileMenuOpen={() => setMobileOpen(true)} />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
