import { format, isToday } from "date-fns"
import { MapPin, CalendarX } from "lucide-react"

export function UpcomingEventsList({ events, department }: { events: any[]; department: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Events</h3>
        <p className="text-sm text-slate-500">Events relevant to your department</p>
      </div>
      
      <div className="p-0">
        {events.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarX className="text-slate-400" size={32} />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No upcoming events for your department.
            </p>
            <p className="text-xs text-slate-500 mt-1">Propose an event to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((event) => {
              const eventDate = new Date(event.date)
              const today = isToday(eventDate)
              
              // Simplistic logic for 'Ongoing' since we only have date/startTime string in DB
              const isOngoing = today && event.status === "ONGOING"

              return (
                <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-slate-400" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          {format(eventDate, "MMMM d, yyyy")} · {event.startTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {event.eventType === "SCHOOL_WIDE" ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                            School-Wide
                          </span>
                        ) : (
                          <span 
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                            style={{ 
                              backgroundColor: department.lightBg, 
                              color: department.color,
                              borderColor: `${department.color}20` 
                            }}
                          >
                            Department
                          </span>
                        )}
                        
                        {isOngoing ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Ongoing
                          </span>
                        ) : today ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Today
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
