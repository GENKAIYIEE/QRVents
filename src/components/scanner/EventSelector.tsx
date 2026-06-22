"use client"

import { useState } from "react"
import { format } from "date-fns"

interface Event {
  id: string
  title: string
  date: string | Date
  venue: string
}

interface EventSelectorProps {
  events: Event[]
  selectedEventId: string | null
  onSelect: (eventId: string) => void
  disabled?: boolean
}

export function EventSelector({ events, selectedEventId, onSelect, disabled }: EventSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedEvent = events.find(e => e.id === selectedEventId)

  if (events.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm flex items-center gap-3">
        <span className="material-symbols-outlined text-amber-600 text-xl">event_busy</span>
        <div>
          <strong className="block font-semibold">No active events</strong>
          There are no currently ongoing events available for scanning.
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-slate-700 mb-2">Select Active Event</label>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'} rounded-xl p-4 flex items-center justify-between text-left transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-slate-300'}`}
      >
        {selectedEvent ? (
          <div>
            <div className="font-bold text-slate-900">{selectedEvent.title}</div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {format(new Date(selectedEvent.date), "MMM d, yyyy")}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {selectedEvent.venue}</span>
            </div>
          </div>
        ) : (
          <span className="text-slate-500">Select an event to begin scanning...</span>
        )}
        <span className="material-symbols-outlined text-slate-400 transition-transform duration-300" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>expand_more</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-20 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => { onSelect(event.id); setIsOpen(false) }}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${selectedEventId === event.id ? 'bg-blue-50/50' : ''}`}
              >
                <div className="font-bold text-slate-900">{event.title}</div>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {format(new Date(event.date), "MMM d, yyyy")}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {event.venue}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
