import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { format } from "date-fns"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Reports — QRVents Dept Admin",
}

export default async function DeptReportsPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  // Fetch events with their attendance count
  const events = await prisma.event.findMany({
    where: { 
      isArchived: false,
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

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-[32px]">bar_chart</span>
          Attendance Reports
        </h1>
        <p className="text-slate-500 mt-1">Export attendance data for your events as CSV files.</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <Link 
          href="/dept/reports"
          className="px-4 py-3 text-sm font-bold border-b-2 border-blue-600 text-blue-600"
        >
          Active Reports
        </Link>
        <Link 
          href="/dept/reports/archived"
          className="px-4 py-3 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all"
        >
          Archived Reports
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800">Available Exports</h2>
          <div className="text-xs font-bold text-slate-500">
            {events.length} Events Total
          </div>
        </div>

        {events.length === 0 ? (
           <div className="py-20 flex flex-col items-center justify-center text-center">
             <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">folder_off</span>
             <h3 className="text-lg font-bold text-slate-700">No Events Found</h3>
             <p className="text-slate-500 text-sm mt-1">Attendance data will appear here once events are created.</p>
           </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((event) => (
              <div key={event.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-extrabold text-slate-900 text-lg">{event.title}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest ${
                        event.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' :
                        event.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">groups</span> 
                      {event._count.attendanceLogs} Recorded Scans
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href={`/dept/reports/${event.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border border-blue-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
