import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { format } from "date-fns"

export const metadata: Metadata = {
  title: "Events — QRVents Dept Admin",
}

export default async function DeptEventsPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  // Fetch approved events (upcoming/ongoing) that the dept admin can manage/see
  const events = await prisma.event.findMany({
    where: { 
      OR: [
        { departmentId: user?.departmentId },
        { eventType: "SCHOOL_WIDE" }
      ]
    },
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { attendanceLogs: true }
      }
    }
  })

  const upcomingEvents = events.filter(e => e.status === "UPCOMING" || e.status === "ONGOING")
  const pastEvents = events.filter(e => e.status === "COMPLETED" || e.status === "CANCELLED")

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events Management</h1>
        <p className="text-slate-500 mt-1">Manage and view details for all upcoming and ongoing events.</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-500">event_available</span>
          Active Events
        </h2>
        
        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">event_busy</span>
            <h3 className="text-lg font-bold text-slate-700">No Active Events</h3>
            <p className="text-slate-500 text-sm mt-1">Submit an event proposal to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
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
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                    <span className="text-sm font-bold text-slate-700">{event._count.attendanceLogs} <span className="text-xs font-semibold text-slate-400">/ {event.expectedAttendees || '∞'}</span></span>
                  </div>
                  {event.status === 'ONGOING' && (
                    <a href="/dept/scanner" className="text-xs font-extrabold text-blue-600 uppercase tracking-wider hover:underline flex items-center gap-1">
                      Scan <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 opacity-70">
            <span className="material-symbols-outlined text-slate-500">history</span>
            Past Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
             {pastEvents.map(event => (
               <div key={event.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                 <h3 className="font-bold text-slate-700 line-clamp-1 mb-1">{event.title}</h3>
                 <div className="text-xs text-slate-500 mb-3">{format(new Date(event.date), "MMM d, yyyy")} • {event.venue}</div>
                 <div className="flex items-center justify-between">
                   <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider">{event.status}</span>
                   <span className="text-xs font-bold text-slate-600">{event._count.attendanceLogs} Attended</span>
                 </div>
               </div>
             ))}
          </div>
        </section>
      )}
    </div>
  )
}
