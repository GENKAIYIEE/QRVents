"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Toaster } from "sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <Toaster position="bottom-right" richColors theme="light" />
      {/* Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative md:ml-[260px]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-gray-200 shadow-sm z-30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">QR</span>
            </div>
            <span className="font-bold text-gray-800 text-lg">QRVents</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 text-gray-600 hover:text-gray-900 rounded-md focus:outline-none"
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
        </header>

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
