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
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 group">
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-[1.3]"
        style={{ background: bg }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
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
          <div className={"flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full "}>
            <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">
              {trendIcon}
            </span>
            {trend.text}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-4xl font-black text-slate-900 leading-none tracking-tight">
          {value}
        </div>
        <div className="text-[13px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
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
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-slate-50/50 bg-slate-50/50">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-blue-600 rounded-[14px] flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
            <span className="material-symbols-outlined text-white text-[22px] [font-variation-settings:'FILL'_1]">
              {icon}
            </span>
          </div>
          <div>
            <div className="font-black text-slate-900 text-[15px] tracking-tight">{title}</div>
            {subtitle && (
              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mt-0.5">{subtitle}</div>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6 flex-1">{children}</div>
    </div>
  )
}

export default async function DeptAdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      
      {/* ── Welcome Banner ── */}
      <div className="bg-gradient-to-br from-indigo-900 via-[#0F1E45] to-blue-900 rounded-[28px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-4">
              <span className="material-symbols-outlined text-[14px] text-blue-300">corporate_fare</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Department Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Hello, {data.session.fullName.split(' ')[0]} 👋
            </h1>
            <p className="text-blue-100/80 font-medium max-w-xl text-sm leading-relaxed">
              Welcome to the {data.deptName} portal. Here's a comprehensive overview of your department's upcoming events, performance, and student engagement.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/dept/events"
              className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">event_available</span>
              Manage Events
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon="group"
          label="Total Students"
          value={data.studentCount}
          sub="Registered in department"
          color="#3B82F6"
          bg="#EFF6FF"
          trend={{ dir: "up", text: "Active" }}
        />
        <StatCard
          icon="broadcast_on_personal"
          label="Active Events"
          value={data.activeEventsCount}
          sub="Currently Ongoing"
          color="#10B981"
          bg="#ECFDF5"
          trend={data.activeEventsCount > 0 ? { dir: "up", text: "Live" } : undefined}
        />
        <StatCard
          icon="task_alt"
          label="Events Hosted"
          value={data.completedEventsCount}
          sub="Successfully completed"
          color="#8B5CF6"
          bg="#F5F3FF"
        />
        <StatCard
          icon="monitoring"
          label="Avg. Attendance"
          value={"%"}
          sub="Across recent events"
          color="#F59E0B"
          bg="#FFFBEB"
          trend={data.avgAttendanceRate > 75 ? { dir: "up", text: "Great" } : { dir: "down", text: "Needs Work" }}
        />
      </div>

      {/* ── Analytics & Upcoming Events ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Performance Analytics (New) */}
          <SectionCard
            title="Performance Analytics"
            subtitle="Attendance turnout for recent events"
            icon="insights"
            action={
              <Link href="/dept/reports" className="text-blue-600 text-xs font-bold hover:text-blue-700 hover:underline">
                View Reports
              </Link>
            }
          >
            {data.recentCompletedEvents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">bar_chart</span>
                <p className="text-sm font-bold text-slate-500">No completed events yet to generate analytics.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {data.recentCompletedEvents.map(event => {
                  const expected = event.expectedAttendees || data.studentCount || 1
                  const attended = event._count.attendanceLogs
                  const rate = Math.min(Math.round((attended / expected) * 100), 100)
                  
                  // Color coding based on turnout
                  const barColor = rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-rose-500"
                  const bgColor = rate >= 80 ? "bg-emerald-50" : rate >= 50 ? "bg-amber-50" : "bg-rose-50"

                  return (
                    <div key={event.id} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 text-sm truncate pr-4">{event.title}</div>
                        <div className="text-xs font-black text-slate-500">{attended} / {expected} <span className="font-medium text-slate-400">Attendees</span></div>
                      </div>
                      <div className={"w-full h-3 rounded-full overflow-hidden flex "}>
                        <div 
                          className={"h-full  rounded-full transition-all duration-1000"} 
                          style={{ width: "%" }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{rate}% Turnout</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>

          {/* Upcoming Events Feed */}
          <SectionCard
            title="Upcoming Events Feed"
            subtitle="Schedule for the next 30 days"
            icon="calendar_month"
          >
            {data.upcomingEvents.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">event_busy</span>
                <p className="text-sm font-bold text-slate-500">No upcoming events scheduled.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {data.upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group cursor-pointer">
                    <div className="w-16 h-16 rounded-[14px] bg-white flex flex-col items-center justify-center shrink-0 border border-slate-100 shadow-sm group-hover:border-blue-200 transition-colors">
                      <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{format(new Date(event.date), "MMM")}</div>
                      <div className="text-2xl font-black text-slate-900 leading-none mt-0.5">{format(new Date(event.date), "dd")}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-slate-900 text-lg truncate group-hover:text-blue-600 transition-colors">{event.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mt-1.5">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {event.startTime}</span>
                        <span className="flex items-center gap-1 truncate"><span className="material-symbols-outlined text-[14px]">location_on</span> {event.venue}</span>
                      </div>
                    </div>
                    <div className="shrink-0 hidden sm:block">
                      <span className={"px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest "}>
                        {event.eventType.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column (1/3) */}
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <SectionCard
            title="Quick Actions"
            subtitle="Common department tasks"
            icon="bolt"
          >
            <div className="flex flex-col gap-3">
              <Link href="/dept/propose-event" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Propose Event</div>
                  <div className="text-xs text-slate-500 font-medium">Submit a new event idea</div>
                </div>
              </Link>
              <Link href="/dept/scanner" className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">Campus Scanner</div>
                  <div className="text-xs text-slate-500 font-medium">Open camera to scan IDs</div>
                </div>
              </Link>
            </div>
          </SectionCard>
        </div>

      </div>
    </div>
  )
}
