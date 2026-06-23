import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { format } from "date-fns"
import { EventsClient } from "./events-client"

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
        
        <EventsClient upcomingEvents={upcomingEvents} />
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
