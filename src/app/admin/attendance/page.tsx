import { Suspense } from "react"
import { getDepartments } from "../events/actions"
import { getEventsForAttendance } from "./actions"
import { AttendanceViewer } from "@/components/admin/attendance-viewer"

export default async function AttendancePage() {
  const [departments, events] = await Promise.all([
    getDepartments(),
    getEventsForAttendance()
  ])

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">


      <Suspense fallback={null}>
        <AttendanceViewer departments={departments} events={events} />
      </Suspense>
    </div>
  )
}
