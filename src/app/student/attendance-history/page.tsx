import { Suspense } from "react"
import { AttendanceHistoryClient } from "./attendance-history-client"

export default function StudentAttendanceHistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
      </div>
    }>
      <AttendanceHistoryClient />
    </Suspense>
  )
}
