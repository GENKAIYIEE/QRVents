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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <StudentSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        session={session}
        department={department}
        studentUser={studentUser}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative md:ml-[260px]">
        <StudentHeader
          session={session}
          department={department}
          studentUser={studentUser}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
