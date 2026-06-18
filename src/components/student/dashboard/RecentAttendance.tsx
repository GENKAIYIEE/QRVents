"use client"

import { format } from "date-fns"
import { CheckCircle2, UserCircle2 } from "lucide-react"

interface RecentAttendanceProps {
  logs: any[]
  studentDepartmentId: string
}

export function RecentAttendance({ logs, studentDepartmentId }: RecentAttendanceProps) {
  if (logs.length === 0) {
    return (
      <div className="py-8 px-5 flex flex-col items-center justify-center text-slate-400 text-center">
        <CheckCircle2 size={32} className="mb-3 text-slate-300" />
        <div className="text-sm font-bold text-slate-500">You have not attended any events yet.</div>
        <div className="text-xs mt-1">Show your QR code at the next event to check in!</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {logs.map((log, idx) => {
        const event = log.event
        const isGuest = event.eventType !== "SCHOOL_WIDE" && event.departmentId !== null && event.departmentId !== studentDepartmentId
        
        return (
          <div 
            key={log.id} 
            className={`px-5 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 ${
              idx === logs.length - 1 ? "border-none" : "border-b border-slate-100"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                {event.title}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="text-slate-500 font-medium">{format(new Date(event.date), "MMMM d, yyyy")}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium truncate">
                  {event.department?.name || "School-Wide"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isGuest ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {isGuest ? <UserCircle2 size={12} /> : <CheckCircle2 size={12} />}
                {isGuest ? "Guest" : "Present"}
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {format(new Date(log.checkIn), "h:mm a")} {log.checkOut ? ` — ${format(new Date(log.checkOut), "h:mm a")}` : ""}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
