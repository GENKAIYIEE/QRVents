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
      <div style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8", textAlign: "center" }}>
        <CheckCircle2 size={32} style={{ marginBottom: "12px" }} color="#CBD5E1" />
        <div style={{ fontSize: "14px", fontWeight: 600 }}>You have not attended any events yet.</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>Show your QR code at the next event to check in!</div>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {logs.map((log, idx) => {
        const event = log.event
        const isGuest = event.eventType !== "SCHOOL_WIDE" && event.departmentId !== null && event.departmentId !== studentDepartmentId
        
        return (
          <div 
            key={log.id} 
            style={{ 
              padding: "16px 20px", 
              borderBottom: idx === logs.length - 1 ? "none" : "1px solid #F1F5F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px"
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {event.title}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "12px", color: "#64748B" }}>{format(new Date(event.date), "MMMM d, yyyy")}</span>
                <span style={{ fontSize: "12px", color: "#CBD5E1" }}>•</span>
                <span style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {event.department?.name || "School-Wide"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
              <div style={{ 
                fontSize: "10px", 
                fontWeight: 700, 
                padding: "3px 8px", 
                borderRadius: "10px", 
                textTransform: "uppercase",
                background: isGuest ? "#FEF3C7" : "#D1FAE5",
                color: isGuest ? "#D97706" : "#059669",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                {isGuest ? <UserCircle2 size={12} /> : <CheckCircle2 size={12} />}
                {isGuest ? "Guest" : "Present"}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "#94A3B8" }}>
                {format(new Date(log.checkIn), "h:mm a")} {log.checkOut ? ` — ${format(new Date(log.checkOut), "h:mm a")}` : ""}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
