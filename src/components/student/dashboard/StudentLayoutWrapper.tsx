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
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4FF" }}>
      <StudentSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        session={session}
        department={department}
        studentUser={studentUser}
      />

      <div className="admin-main-wrapper">
        <StudentHeader
          session={session}
          department={department}
          studentUser={studentUser}
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="admin-page-container">
          {children}
        </main>
      </div>
    </div>
  )
}
