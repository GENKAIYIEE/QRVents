import { getDashboardData } from "@/lib/student/dashboard-data"
import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"
import { QrClient } from "./qr-client"
import { Suspense } from "react"

export default async function StudentQrCodePage() {
  const data = await getDashboardData()

  return (
    <StudentLayoutWrapper 
      session={data.session} 
      department={data.department}
      studentUser={data.studentUser}
    >
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <span className="material-symbols-outlined animate-spin text-blue-500 text-4xl [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      }>
        <QrClient />
      </Suspense>
    </StudentLayoutWrapper>
  )
}
