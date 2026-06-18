import { getDashboardStats } from "./actions"
import { DeptBarChart, EventPieChart, TrendAreaChart } from "@/components/admin/dashboard-charts"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bgClass,
  trend,
}: {
  icon: string
  label: string
  value: string | number
  sub?: string
  color: string
  bgClass: string
  trend?: { dir: "up" | "down" | "neutral"; text: string }
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Subtle gradient blob */}
      <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 ${bgClass}`} />

      <div className="flex items-start justify-between relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
          <span className="material-symbols-outlined text-[24px] [font-variation-settings:'FILL'_1]" style={{ color }}>
            {icon}
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
            trend.dir === "up" ? "text-green-600 bg-green-50" : 
            trend.dir === "down" ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-50"
          }`}>
            <span className="material-symbols-outlined text-[14px] [font-variation-settings:'FILL'_1]">
              {trend.dir === "up" ? "trending_up" : trend.dir === "down" ? "trending_down" : "remove"}
            </span>
            {trend.text}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </div>
        <div className="text-slate-500 text-[13px] font-semibold mt-1.5">
          {label}
        </div>
        {sub && (
          <div className="text-slate-400 text-[11px] mt-1">{sub}</div>
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 pb-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-[10px] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-500 text-[18px] [font-variation-settings:'FILL'_1]">
              {icon}
            </span>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">{title}</div>
            {subtitle && (
              <div className="text-slate-400 text-[11px] mt-0.5 font-medium">{subtitle}</div>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  )
}

// ── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({
  href,
  icon,
  label,
  colorClass,
  bgClass,
}: {
  href: string
  icon: string
  label: string
  colorClass: string
  bgClass: string
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border border-slate-100 ${bgClass}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass} mix-blend-multiply`}>
        <span className={`material-symbols-outlined text-[24px] [font-variation-settings:'FILL'_1] ${colorClass}`}>
          {icon}
        </span>
      </div>
      <span className="text-slate-700 text-[12px] font-bold text-center leading-tight">
        {label}
      </span>
    </Link>
  )
}

// ── Proposal Status Badge ─────────────────────────────────────────────────────
function ProposalBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:  "text-amber-600 bg-amber-50",
    APPROVED: "text-emerald-600 bg-emerald-50",
    ON_HOLD:  "text-purple-600 bg-purple-50",
    REJECTED: "text-red-600 bg-red-50",
  }
  const colorClass = map[status] ?? "text-slate-500 bg-slate-100"
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${colorClass}`}>
      {status.replace("_", " ")}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  const now = new Date()

  // Build dept chart data
  const deptChartData = stats.departments.map((d) => ({
    code: d.code,
    students: d._count.users,
    events: d._count.events,
    color: d.color,
  }))

  // Build pie data from events this year
  const upcomingCount  = stats.eventsThisYear.filter((e) => e.status === "UPCOMING").length
  const ongoingCount   = stats.eventsThisYear.filter((e) => e.status === "ONGOING").length
  const completedCount = stats.eventsThisYear.filter((e) => e.status === "COMPLETED").length
  const cancelledCount = stats.eventsThisYear.filter((e) => e.status === "CANCELLED").length

  const pieData = [
    { name: "Upcoming",  value: upcomingCount  || 0, color: "#3B82F6" },
    { name: "Ongoing",   value: ongoingCount   || 0, color: "#22C55E" },
    { name: "Completed", value: completedCount || 0, color: "#8B5CF6" },
    { name: "Cancelled", value: cancelledCount || 0, color: "#EF4444" },
  ].filter((d) => d.value > 0)

  // Build 6-month trend
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const trendMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    trendMap[monthNames[d.getMonth()]] = 0
  }
  stats.eventsThisYear.forEach((e) => {
    const key = monthNames[new Date(e.date).getMonth()]
    if (key in trendMap) trendMap[key] = (trendMap[key] || 0) + 1
  })
  const trendData = Object.entries(trendMap).map(([month, events]) => ({ month, events }))

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            System metrics and active event status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Event
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="groups"
          label="Total Students"
          value={stats.totalStudents}
          color="#3B82F6"
          bgClass="bg-blue-50"
          trend={{ dir: "up", text: "Active" }}
        />
        <StatCard
          icon="event_available"
          label="Finished Events"
          value={stats.finishedEvents}
          color="#10B981"
          bgClass="bg-emerald-50"
          trend={{ dir: "up", text: "This year" }}
        />
        <StatCard
          icon="assignment_late"
          label="Pending Proposals"
          value={stats.pendingProposals}
          color="#F59E0B"
          bgClass="bg-amber-50"
          trend={stats.pendingProposals > 0 ? { dir: "neutral", text: "Needs review" } : undefined}
        />
        <StatCard
          icon="wifi_tethering"
          label="Live Attendance"
          value={stats.attendanceCount}
          color="#8B5CF6"
          bgClass="bg-purple-50"
          sub="Last 30 days"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard 
            title="Department Metrics" 
            subtitle="Student count and total events per department"
            icon="bar_chart"
          >
            <div className="h-[280px] w-full">
              <DeptBarChart data={deptChartData} />
            </div>
          </SectionCard>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SectionCard 
            title="Events by Status" 
            subtitle="Current academic year"
            icon="pie_chart"
          >
            <div className="h-[200px] w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <EventPieChart data={pieData} />
              ) : (
                <div className="text-slate-400 text-sm font-medium">No events this year</div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions & Upcoming */}
        <div className="flex flex-col gap-6">
          <SectionCard title="Quick Actions" subtitle="Frequently used tools" icon="bolt">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <QuickAction
                href="/admin/events"
                icon="calendar_add_on"
                label="Create Event"
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
              />
              <QuickAction
                href="/admin/scanner"
                icon="qr_code_scanner"
                label="Open Scanner"
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />
              <QuickAction
                href="/admin/proposals"
                icon="assignment_turned_in"
                label="Proposals"
                colorClass="text-amber-600"
                bgClass="bg-amber-50"
              />
              <QuickAction
                href="/admin/reports"
                icon="summarize"
                label="Export Reports"
                colorClass="text-purple-600"
                bgClass="bg-purple-50"
              />
              <QuickAction
                href="/admin/dept-admins"
                icon="manage_accounts"
                label="Manage Admins"
                colorClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />
              <QuickAction
                href="/admin/settings"
                icon="settings"
                label="Settings"
                colorClass="text-slate-600"
                bgClass="bg-slate-50"
              />
            </div>
          </SectionCard>

          <SectionCard 
            title="Upcoming Events" 
            subtitle="Next scheduled activities"
            icon="event_upcoming"
            action={
              <Link href="/admin/events" className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors">
                View All
              </Link>
            }
          >
            {stats.upcomingEventsList.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-50">
                {stats.upcomingEventsList.map((evt) => (
                  <div key={evt.id} className="py-3 flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center shrink-0 border border-blue-100">
                        <span className="text-[10px] font-bold uppercase leading-none">{format(new Date(evt.date), "MMM")}</span>
                        <span className="text-[14px] font-extrabold leading-tight">{format(new Date(evt.date), "dd")}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {evt.title}
                        </div>
                        <div className="text-slate-500 text-xs truncate mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {evt.startTime} • {evt.venue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">event_busy</span>
                <p className="text-slate-500 text-sm font-medium">No upcoming events scheduled.</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent Proposals */}
        <div className="flex flex-col gap-6">
          <SectionCard 
            title="Recent Event Proposals" 
            subtitle="Latest requests from departments"
            icon="rate_review"
            action={
              <Link href="/admin/proposals" className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors">
                View All
              </Link>
            }
          >
            {stats.recentProposals.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-50 h-full">
                {stats.recentProposals.map((prop) => (
                  <div key={prop.id} className="py-3.5 flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: prop.department.color + "15", color: prop.department.color }}
                    >
                      <span className="font-extrabold text-[11px]">{prop.department.code}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-sm truncate">{prop.title}</div>
                        <ProposalBadge status={prop.status} />
                      </div>
                      <div className="text-slate-500 text-xs mt-1">
                        By {prop.submittedBy.fullName} • {formatDistanceToNow(new Date(prop.submittedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">inbox</span>
                <p className="text-slate-500 text-sm font-medium">No recent proposals.</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
