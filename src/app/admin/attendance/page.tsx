import { getDepartments } from "../events/actions"
import { getEventsForAttendance } from "./actions"
import { AttendanceViewer } from "@/components/admin/attendance-viewer"

export default async function AttendancePage() {
  const [departments, events] = await Promise.all([
    getDepartments(),
    getEventsForAttendance()
  ])

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
          <span className="text-slate-400 text-xs font-semibold">/</span>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Attendance Monitor</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Live Attendance</h1>
      </div>

      <AttendanceViewer events={events} departments={departments} />
    </div>
  )
}

