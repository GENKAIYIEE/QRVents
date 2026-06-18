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
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Attendance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Live Attendance</h1>
      </div>

      <AttendanceViewer departments={departments} events={events} />
    </div>
  )
}
