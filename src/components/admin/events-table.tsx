"use client"

import { useState } from "react"
import { format } from "date-fns"
import { EventStatus } from "@prisma/client"
import { formatTimeString } from "@/lib/utils"
import { toast } from "sonner"

interface EventsTableProps {
  events: any[]
  onEdit: (event: any) => void
  onStatusChange: (id: string, status: EventStatus) => void
  onDelete: (id: string) => void
  onGeneratePenalties?: (event: any) => void
}

export function EventsTable({ events, onEdit, onStatusChange, onDelete, onGeneratePenalties }: EventsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [eventToDelete, setEventToDelete] = useState<any | null>(null)
  const [eventToArchive, setEventToArchive] = useState<any | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const statusConfig: Record<EventStatus, { label: string, color: string, bg: string }> = {
    UPCOMING: { label: "Upcoming", color: "text-blue-700", bg: "bg-blue-100" },
    ONGOING: { label: "Ongoing", color: "text-emerald-700", bg: "bg-emerald-100" },
    COMPLETED: { label: "Completed", color: "text-purple-700", bg: "bg-purple-100" },
    CANCELLED: { label: "Cancelled", color: "text-rose-700", bg: "bg-rose-100" },
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
          <span className="material-symbols-outlined text-slate-400 text-[36px] [font-variation-settings:'FILL'_0,'wght'_300]">calendar_today</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2">No events found</h3>
        <p className="text-slate-500 text-[15px] max-w-md text-center leading-relaxed font-medium">
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
                    <div className="text-xs text-slate-500 mt-0.5">{formatTimeString(event.startTime)} - {formatTimeString(event.endTime)}</div>
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
                      {event.status === "COMPLETED" && event.isMandatory && !event.penaltiesGenerated && onGeneratePenalties && (
                        <button
                          onClick={() => onGeneratePenalties(event)}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-bold text-xs transition-colors border border-amber-200"
                          title="Generate Penalties"
                        >
                          <span className="material-symbols-outlined text-[14px]">gavel</span>
                          Generate Penalties
                        </button>
                      )}
                      <button 
                        onClick={() => onEdit(event)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit Event"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                      </button>
                      {event.status === 'COMPLETED' && (
                        <button 
                          onClick={() => setEventToArchive(event)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            event.isArchived 
                              ? 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                              : 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                          title={event.isArchived ? "Restore Event" : "Archive Event"}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {event.isArchived ? 'unarchive' : 'archive'}
                          </span>
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          if (hasAttendance && !event.isArchived) return;
                          setEventToDelete(event)
                        }}
                        disabled={(hasAttendance && !event.isArchived) || deletingId === event.id}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          hasAttendance && !event.isArchived
                            ? 'text-slate-300 cursor-not-allowed' 
                            : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                        title={(hasAttendance && !event.isArchived) ? "Archive event first to delete it." : "Permanent Delete Event"}
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

      {eventToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                <span className="material-symbols-outlined text-[40px] [font-variation-settings:'FILL'_1]">delete_forever</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Delete Event?</h3>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">"{eventToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setEventToDelete(null)}
                  className="flex-1 py-3.5 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setDeletingId(eventToDelete.id)
                    onDelete(eventToDelete.id)
                    setEventToDelete(null)
                  }}
                  className="flex-1 py-3.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-md shadow-rose-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {eventToArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 text-center flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border ${
                eventToArchive.isArchived 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                <span className="material-symbols-outlined text-[40px] [font-variation-settings:'FILL'_1]">
                  {eventToArchive.isArchived ? 'unarchive' : 'archive'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {eventToArchive.isArchived ? "Restore Event?" : "Archive Event?"}
              </h3>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">
                {eventToArchive.isArchived 
                  ? "This event will be moved back to your active list."
                  : "This event will be hidden from the active list and moved to the archives."}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setEventToArchive(null)}
                  disabled={isArchiving}
                  className="flex-1 py-3.5 font-bold text-slate-600 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsArchiving(true)
                    try {
                      const { toggleArchiveEvent } = await import('@/app/admin/events/actions')
                      await toggleArchiveEvent(eventToArchive.id, !eventToArchive.isArchived)
                      toast.success(`Event ${eventToArchive.isArchived ? 'restored' : 'archived'} successfully!`)
                      window.location.reload()
                    } catch (e) {
                      toast.error("Failed to update event status.")
                    } finally {
                      setIsArchiving(false)
                      setEventToArchive(null)
                    }
                  }}
                  disabled={isArchiving}
                  className={`flex-1 py-3.5 font-bold text-white rounded-xl transition-all shadow-md disabled:opacity-50 ${
                    eventToArchive.isArchived 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  }`}
                >
                  {isArchiving ? "Updating..." : "Yes, Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
