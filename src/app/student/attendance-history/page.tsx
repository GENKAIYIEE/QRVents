
import { Suspense } from "react"
import { getDashboardData } from "@/lib/student/dashboard-data"
import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"
import { AttendanceHistoryClient } from "./attendance-history-client"

export default async function StudentAttendanceHistoryPage() {
  const data = await getDashboardData()

  return (
    <StudentLayoutWrapper 
      session={data.session} 
      department={data.department}
      studentUser={data.studentUser}
    >
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      }>
        <AttendanceHistoryClient />
      </Suspense>
    </StudentLayoutWrapper>
  )
}
