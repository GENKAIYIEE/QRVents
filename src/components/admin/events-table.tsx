"use client"

import { useState } from "react"
import { format } from "date-fns"
import { EventStatus } from "@prisma/client"

interface EventsTableProps {
  events: any[]
  onEdit: (event: any) => void
  onStatusChange: (id: string, status: EventStatus) => void
  onDelete: (id: string) => void
}

export function EventsTable({ events, onEdit, onStatusChange, onDelete }: EventsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const statusConfig: Record<EventStatus, { label: string, color: string, bg: string }> = {
    UPCOMING: { label: "Upcoming", color: "text-blue-700", bg: "bg-blue-100" },
    ONGOING: { label: "Ongoing", color: "text-emerald-700", bg: "bg-emerald-100" },
    COMPLETED: { label: "Completed", color: "text-purple-700", bg: "bg-purple-100" },
    CANCELLED: { label: "Cancelled", color: "text-rose-700", bg: "bg-rose-100" },
  }

  if (events.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "96px 24px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
        <div style={{ width: "80px", height: "80px", backgroundColor: "#F8FAFC", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", border: "1px solid #F1F5F9", boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)" }}>
          <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 0, 'wght' 300" }}>calendar_today</span>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#1E293B", marginBottom: "8px", margin: "0 0 8px 0" }}>No events found</h3>
        <p style={{ color: "#64748B", fontSize: "15px", maxWidth: "448px", textAlign: "center", lineHeight: 1.6, margin: 0 }}>
          There are no events matching your current filters. Try adjusting your search or create a new event to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">Event Details</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Attendance</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.map((event) => {
              const status = statusConfig[event.status as EventStatus]
              const hasAttendance = event._count?.attendanceLogs > 0

              return (
                <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.eventType === 'SCHOOL_WIDE' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {event.eventType === 'SCHOOL_WIDE' ? 'account_balance' : 'corporate_fare'}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{event.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                          {event.venue}
                          {event.department && ` • ${event.department.code}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{format(new Date(event.date), "MMM d, yyyy")}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{event.startTime} - {event.endTime}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={event.status}
                      onChange={(e) => onStatusChange(event.id, e.target.value as EventStatus)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer outline-none ${status.bg} ${status.color} appearance-none`}
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-full">
                      {event._count?.attendanceLogs || 0}
                      {event.expectedAttendees ? ` / ${event.expectedAttendees}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => onEdit(event)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit Event"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (hasAttendance) return;
                          if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
                            setDeletingId(event.id)
                            onDelete(event.id)
                          }
                        }}
                        disabled={hasAttendance || deletingId === event.id}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          hasAttendance 
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title={hasAttendance ? "Cannot delete event with attendance records" : "Delete Event"}
                      >
                        {deletingId === event.id ? (
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
