"use client"

import { useState } from "react"
import { StudentSidebar } from "./StudentSidebar"
import { StudentHeader } from "./StudentHeader"

interface StudentLayoutWrapperProps {
  children: React.ReactNode
  session: {
    userId: string
    email: string
    role: string
    fullName: string
    departmentId?: string | null
    departmentCode?: string | null
  }
  department: {
    id: string
    code: string
    name: string
    color: string
    lightBg: string
  } | null
  studentUser: {
    id: string
    yearLevel?: string | null
    studentId?: string | null
  } | null
}

export function StudentLayoutWrapper({ children, session, department, studentUser }: StudentLayoutWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        session={session}
        department={department}
        studentUser={studentUser}
      />

      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen transition-all duration-300 relative z-10 w-full overflow-hidden">
        <StudentHeader
          session={session}
          department={department}
          studentUser={studentUser}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden max-w-[100vw] md:max-w-none">
          {children}
        </main>
      </div>
    </div>
  )
}
