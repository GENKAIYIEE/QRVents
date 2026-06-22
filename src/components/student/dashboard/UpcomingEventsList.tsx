"use client"

import { motion } from "framer-motion"
import { format, isToday } from "date-fns"
import { MapPin, QrCode, Calendar } from "lucide-react"
import { formatTimeString } from "@/lib/utils"

interface UpcomingEventsListProps {
  events: any[]
  department: any
  emptyMessage?: string
}

export function UpcomingEventsList({ events, department, emptyMessage = "No upcoming events at the moment." }: UpcomingEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 text-center px-5">
        <Calendar size={32} className="mb-3 text-slate-300" />
        <div className="text-sm font-bold text-slate-500">{emptyMessage}</div>
        <div className="text-xs mt-1">Check back soon!</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event, idx) => {
        const isSchoolWide = event.eventType === "SCHOOL_WIDE"
        const eventDate = new Date(event.date)
        const isEventToday = isToday(eventDate)
        
        let statusBadge = { label: "Upcoming", color: "text-slate-600 bg-slate-100" }
        if (isEventToday) {
          statusBadge = { label: "Today", color: "text-emerald-600 bg-emerald-100" }
        } else if (event.status === "ONGOING") {
          statusBadge = { label: "Ongoing", color: "text-amber-600 bg-amber-100" }
        }

        const typeBadge = isSchoolWide 
          ? { label: "School-Wide", color: "text-blue-700 bg-blue-100" } 
          : { label: event.department?.code || "Department", color: "text-blue-700 bg-blue-100" }

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_4px_15px_rgba(0,0,0,0.02)] flex flex-col gap-3 transition-all duration-200"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="text-[15px] font-bold text-slate-900 leading-tight">{event.title}</div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${statusBadge.color}`}>
                {statusBadge.label}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${typeBadge.color}`}>
                {typeBadge.label}
              </div>
              <div className="text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md">
                {event.department?.name || "School-Wide"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} />
                <span className="text-xs font-medium">
                  {format(eventDate, "MMMM d, yyyy")} · {formatTimeString(event.startTime)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} />
                <span className="text-xs font-medium">{event.venue}</span>
              </div>
            </div>

            <div className="mt-auto pt-3 border-t border-dashed border-slate-200 flex items-center gap-2 text-slate-500">
              <QrCode size={14} />
              <span className="text-[11px] font-medium">Scan your QR code at the venue to check in</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
