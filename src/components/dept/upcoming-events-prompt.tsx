"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

export function UpcomingEventsPrompt({ events }: { events: any[] }) {
  const router = useRouter()
  const [startingId, setStartingId] = useState<string | null>(null)

  const handleStartEvent = async (eventId: string) => {
    setStartingId(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ONGOING" })
      })
      if (!res.ok) throw new Error("Failed to start event")
      
      toast.success("Event started! You can now scan attendees.")
      router.refresh()
    } catch (error) {
      toast.error("Failed to start the event.")
      setStartingId(null)
    }
  }

  if (!events || events.length === 0) return null

  return (
    <div className="bg-white rounded-3xl p-8 border border-blue-100 shadow-sm max-w-2xl mx-auto w-full mt-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <span className="material-symbols-outlined text-[32px]">event_upcoming</span>
        </div>
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Scheduled for Today</h3>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto font-medium leading-relaxed">
          You have an event scheduled to happen today. Start it now to activate the campus scanner and live attendance.
        </p>
      </div>

      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 transition-all hover:border-blue-200">
            <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center shrink-0 border border-slate-100 shadow-sm">
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-widest leading-none mt-0.5">
                {format(new Date(event.date), "MMM")}
              </span>
              <span className="text-xl font-black text-slate-800 leading-none mt-0.5">
                {format(new Date(event.date), "dd")}
              </span>
            </div>
            
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
              <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {event.startTime} - {event.endTime}
              </div>
            </div>

            <button
              onClick={() => handleStartEvent(event.id)}
              disabled={startingId === event.id}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {startingId === event.id ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">play_circle</span>
              )}
              Start Event
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
