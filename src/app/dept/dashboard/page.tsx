import { Suspense } from "react"
import { getDashboardData } from "@/lib/dept-admin/dashboard-data"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
  trend,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
  bg: string
  trend?: { dir: "up" | "down" | "neutral"; text: string }
}) {
  const trendColor = trend?.dir === "up" ? "text-emerald-500 bg-emerald-500/10" : trend?.dir === "down" ? "text-red-500 bg-red-500/10" : "text-slate-400 bg-slate-100"
  const trendIcon = trend?.dir === "up" ? "trending_up" : trend?.dir === "down" ? "trending_down" : "remove"

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 group">
      {/* Subtle gradient blob */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 transition-transform group-hover:scale-110"
        style={{ background: bg }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: bg }}
        >
          <span
            className="material-symbols-outlined text-[24px] [font-variation-settings:'FILL'_1]"
            style={{ color }}
          >
            {icon}
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${trendColor}`}>
            <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">
              {trendIcon}
            </span>
            {trend.text}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
          {value}
        </div>
        <div className="text-[13px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">
          {label}
        </div>
        {sub && (
          <div className="text-[11px] text-slate-400 font-semibold mt-1">{sub}</div>
        )}
      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  icon,
  children,
  action,
}: {
  title: string
  subtitle?: string
  icon: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-slate-50/50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-500 text-[20px] [font-variation-settings:'FILL'_1]">
              {icon}
            </span>
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</div>
            {subtitle && (
              <div className="text-slate-400 text-[11px] font-medium mt-0.5">{subtitle}</div>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  )
}

export default async function DeptAdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="group"
          label="Total Students"
          value={data.studentCount}
          sub="Registered in department"
          color="#3B82F6"
          bg="#EFF6FF"
          trend={{ dir: "up", text: "+12%" }}
        />
        <StatCard
          icon="pending_actions"
          label="Pending Proposals"
          value={data.pendingCount}
          sub="Requires your action"
          color="#EAB308"
          bg="#FEFCE8"
        />
        <StatCard
          icon="task_alt"
          label="Approved Proposals"
          value={data.approvedCount}
          sub="Ready for execution"
          color="#22C55E"
          bg="#F0FDF4"
        />
        <StatCard
          icon="event"
          label="Upcoming Events"
          value={data.upcomingEvents.length}
          sub="Next 30 days"
          color="#8B5CF6"
          bg="#F5F3FF"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <SectionCard
            title="Upcoming Events"
            subtitle="Department and School-wide events"
            icon="calendar_month"
            action={
              <Link href="#" className="text-blue-600 text-xs font-bold hover:text-blue-700 hover:underline">
                View Calendar
              </Link>
            }
          >
            {data.upcomingEvents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">event_busy</span>
                <p className="text-sm font-bold text-slate-500">No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 flex flex-col items-center justify-center shrink-0 border border-blue-100/50">
                      <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">{format(new Date(event.date), "MMM")}</div>
                      <div className="text-xl font-black text-blue-700 leading-none">{format(new Date(event.date), "dd")}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{event.title}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        event.eventType === 'SCHOOL_WIDE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {event.eventType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Recent Student Registrations"
            subtitle="Latest additions to your department"
            icon="group_add"
          >
            {data.recentStudents.length === 0 ? (
               <div className="py-8 flex flex-col items-center justify-center text-center">
                 <p className="text-sm font-bold text-slate-500">No students registered yet.</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Student</th>
                      <th className="px-4 py-3">Year Level</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.recentStudents.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{s.fullName}</div>
                          <div className="text-xs text-slate-500 font-medium">{s.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase">
                            {s.yearLevel || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 font-medium text-xs">
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard
            title="Recent Proposals"
            icon="draft"
            action={
              <Link href="#" className="text-blue-600 text-xs font-bold hover:text-blue-700 hover:underline">
                View All
              </Link>
            }
          >
             {data.recentProposals.length === 0 ? (
               <div className="py-8 flex flex-col items-center justify-center text-center">
                 <p className="text-sm font-bold text-slate-500">No proposals submitted.</p>
               </div>
             ) : (
               <div className="flex flex-col gap-3">
                 {data.recentProposals.map(prop => (
                   <div key={prop.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                     <div className="flex items-start justify-between gap-2 mb-2">
                       <div className="font-bold text-slate-900 text-sm line-clamp-1">{prop.title}</div>
                       <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                         prop.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                         prop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                         prop.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                         'bg-slate-100 text-slate-700'
                       }`}>
                         {prop.status}
                       </span>
                     </div>
                     <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                       <span className="material-symbols-outlined text-[14px]">event</span>
                       {format(new Date(prop.date), "MMM d, yyyy")}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </SectionCard>

          <SectionCard
             title="Activity Log"
             icon="history"
          >
             {data.recentActivity.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-slate-500">No recent activity.</p>
                </div>
             ) : (
                <div className="relative pl-3">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-100" />
                  <div className="flex flex-col gap-4">
                    {data.recentActivity.map((log) => (
                      <div key={log.id} className="relative pl-5">
                        <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 ring-4 ring-white" />
                        <div className="text-xs text-slate-600 font-medium leading-relaxed">
                           {log.action}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                           {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
