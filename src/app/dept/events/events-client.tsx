"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CompleteEventModal } from "@/components/admin/complete-event-modal"
import Link from "next/link"

export function EventsClient({ upcomingEvents }: { upcomingEvents: any[] }) {
  const router = useRouter()
  const [startingEventId, setStartingEventId] = useState<string | null>(null)
  const [eventToComplete, setEventToComplete] = useState<any | null>(null)

  const handleStartEvent = async (eventId: string) => {
    setStartingEventId(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ONGOING" })
      })

      if (!res.ok) throw new Error("Failed to start event")
      
      toast.success("Event started successfully! You can now scan attendees.")
      router.refresh()
    } catch (error) {
      toast.error("An error occurred while starting the event.")
    } finally {
      setStartingEventId(null)
    }
  }

  const handleCompleteConfirmed = () => {
    toast.success("Event completed successfully! Penalties have been processed.")
    router.refresh()
    setEventToComplete(null)
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
        <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">event_busy</span>
        <h3 className="text-lg font-bold text-slate-700">No Active Events</h3>
        <p className="text-slate-500 text-sm mt-1">Submit an event proposal to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col">
            <div className="p-6 pb-5 flex-1 relative">
              <div className="absolute top-0 right-0 p-6 pointer-events-none">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  event.status === 'ONGOING' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-blue-100 text-blue-700'
                }`}>
                  {event.status}
                </span>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex flex-col items-center justify-center border border-blue-100/50 mb-5 group-hover:scale-105 transition-transform">
                <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest leading-none">{format(new Date(event.date), "MMM")}</div>
                <div className="text-2xl font-black text-blue-700 leading-none mt-1">{format(new Date(event.date), "dd")}</div>
              </div>

              <h3 className="font-extrabold text-slate-900 text-xl leading-tight mb-2 group-hover:text-blue-600 transition-colors pr-16">{event.title}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                  {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                  {event.venue}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">public</span>
                  {event.eventType.replace('_', ' ')}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                  <span className="text-sm font-bold text-slate-700">{event._count.attendanceLogs} <span className="text-xs font-semibold text-slate-400">/ {event.expectedAttendees || '∞'}</span></span>
                </div>
                
                {event.status === 'ONGOING' && (
                  <Link href="/dept/scanner" className="text-xs font-extrabold text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1">
                    Scan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                )}
              </div>

              {event.status === "UPCOMING" && (
                <button
                  onClick={() => handleStartEvent(event.id)}
                  disabled={startingEventId === event.id}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {startingEventId === event.id ? (
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  )}
                  Start Event
                </button>
              )}

              {event.status === "ONGOING" && (
                <button
                  onClick={() => setEventToComplete(event)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  Complete Event
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {eventToComplete && (
        <CompleteEventModal
          eventId={eventToComplete.id}
          eventTitle={eventToComplete.title}
          isOpen={!!eventToComplete}
          onClose={() => setEventToComplete(null)}
          onConfirmed={handleCompleteConfirmed}
        />
      )}
    </>
  )
}
