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
  const trendColor =
    trend?.dir === "up" ? "#22C55E" : trend?.dir === "down" ? "#EF4444" : "#94A3B8"
  const trendIcon =
    trend?.dir === "up" ? "trending_up" : trend?.dir === "down" ? "trending_down" : "remove"

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "22px 24px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
        border: "1px solid #F1F5F9",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
        transition: "transform 200ms ease, box-shadow 200ms ease",
      }}
    >
      {/* Subtle gradient blob */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          right: "-30px",
          width: "120px",
          height: "120px",
          background: bg,
          borderRadius: "50%",
          opacity: 0.3,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div
          style={{
            width: "46px",
            height: "46px",
            background: bg,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color, fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>

        {trend && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              color: trendColor,
              fontSize: "11px",
              fontWeight: 600,
              background: `${trendColor}15`,
              padding: "4px 8px",
              borderRadius: "20px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
            >
              {trendIcon}
            </span>
            {trend.text}
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#0F172A",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          {value}
        </div>
        <div style={{ color: "#64748B", fontSize: "13px", fontWeight: 500, marginTop: "6px" }}>
          {label}
        </div>
        {sub && (
          <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "3px" }}>{sub}</div>
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
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 20px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 24px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #F8FAFC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#EFF6FF",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#3B82F6", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "14px" }}>{title}</div>
            {subtitle && (
              <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "1px" }}>{subtitle}</div>
            )}
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  )
}

// ── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({
  href,
  icon,
  label,
  color,
  bg,
}: {
  href: string
  icon: string
  label: string
  color: string
  bg: string
}) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "18px 12px",
        background: bg,
        border: `1px solid ${color}25`,
        borderRadius: "14px",
        textDecoration: "none",
        transition: "transform 200ms ease, box-shadow 200ms ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          background: `${color}20`,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ color, fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <span style={{ color: "#374151", fontSize: "11px", fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </a>
  )
}

// ── Proposal Status Badge ─────────────────────────────────────────────────────
function ProposalBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:  { label: "Pending",  color: "#D97706", bg: "#FEF3C7" },
    APPROVED: { label: "Approved", color: "#059669", bg: "#D1FAE5" },
    ON_HOLD:  { label: "On Hold",  color: "#7C3AED", bg: "#EDE9FE" },
    REJECTED: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2" },
  }
  const cfg = map[status] ?? { label: status, color: "#64748B", bg: "#F1F5F9" }
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 9px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.4px",
        color: cfg.color,
        background: cfg.bg,
        textTransform: "uppercase",
      }}
    >
      {cfg.label}
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
    <div>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      {/* Header removed: moved to sticky navbar in layout */}

      {/* ── Stat Cards Row ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon="school"
          label="Students Registered"
          value={stats.totalStudents.toLocaleString()}
          sub="Active enrolled students"
          color="#3B82F6"
          bg="#EFF6FF"
          trend={{ dir: "up", text: "All Active" }}
        />
        <StatCard
          icon="event_available"
          label="Finished Events"
          value={stats.finishedEvents}
          sub="Successfully concluded"
          color="#8B5CF6"
          bg="#F5F3FF"
          trend={{ dir: "neutral", text: "Verified" }}
        />
        <StatCard
          icon="assignment_late"
          label="Pending Proposals"
          value={stats.pendingProposals}
          sub={`${stats.onHoldProposals} on hold`}
          color="#F59E0B"
          bg="#FFFBEB"
          trend={
            stats.pendingProposals > 0
              ? { dir: "down", text: "Needs review" }
              : { dir: "neutral", text: "All cleared" }
          }
        />
        <StatCard
          icon="manage_accounts"
          label="Dept Admins"
          value={stats.totalDeptAdmins}
          sub="Department deans registered"
          color="#10B981"
          bg="#ECFDF5"
          trend={{ dir: "up", text: "Active" }}
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "24px",
          alignItems: "start",
        }}
        className="dashboard-main-grid"
      >
        {/* ── Left Column: Analytics & Proposals ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          {/* Department Breakdown */}
          <SectionCard
            title="Student Distribution per Department"
            subtitle="Registered students count by academic unit"
            icon="groups"
          >
            {deptChartData.length > 0 ? (
              <>
                <DeptBarChart data={deptChartData} />
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                  {deptChartData.map((d) => (
                    <div key={d.code} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: d.color, display: "inline-block" }} />
                      <span style={{ color: "#94A3B8", fontSize: "11px" }}>{d.code}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#CBD5E1", gap: "8px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>bar_chart</span>
                <span style={{ fontSize: "13px" }}>No data yet</span>
              </div>
            )}
          </SectionCard>

          {/* Recent Proposals moved here to remove the gap */}
          <SectionCard
            title="Recent Proposals"
            subtitle="Latest event proposals from departments"
            icon="assignment"
            action={
              <Link href="/admin/proposals" style={{ color: "#3B82F6", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats.recentProposals.length > 0 ? (
                stats.recentProposals.map((proposal: any) => (
                  <div key={proposal.id} style={{ padding: "14px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: proposal.department.color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span className="material-symbols-outlined" style={{ color: proposal.department.color, fontSize: "20px" }}>corporate_fare</span>
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{proposal.title}</div>
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{proposal.department.code} · Submitted by {proposal.submittedBy.fullName}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: proposal.status === "PENDING" ? "#FEF3C7" : "#E0E7FF", color: proposal.status === "PENDING" ? "#92400E" : "#3730A3", textTransform: "uppercase" }}>{proposal.status}</div>
                      <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px" }}>{format(new Date(proposal.submittedAt), "MMM d")}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#CBD5E1", gap: "10px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>assignment</span>
                  <span style={{ fontSize: "13px" }}>No proposals yet</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Right Column: Events & Actions ───────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <SectionCard
            title="Upcoming Campus Events"
            subtitle="Major events & activities"
            icon="calendar_today"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {stats.upcomingEventsList.length > 0 ? (
                stats.upcomingEventsList.map((event: any) => (
                  <div key={event.id} style={{ padding: "12px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{event.title}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, background: "#DBEAFE", color: "#1E40AF", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>{event.startTime}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>location_on</span>
                      <span style={{ fontSize: "12px" }}>{event.venue}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>calendar_month</span>
                      <span style={{ fontSize: "12px" }}>{format(new Date(event.date), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ height: "160px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8", textAlign: "center", padding: "0 20px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px", marginBottom: "8px" }}>event_busy</span>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>No upcoming events</div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions" subtitle="Common admin tasks" icon="bolt">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "New Event", icon: "add_circle", color: "#3B82F6" },
                { label: "Reports", icon: "description", color: "#10B981" },
                { label: "Scan QR", icon: "qr_code_scanner", color: "#8B5CF6" },
                { label: "Add Dept Admin", icon: "person_add", color: "#EC4899" },
              ].map((action) => (
                <button key={action.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "12px", cursor: "pointer", transition: "all 200ms ease" }}>
                  <span className="material-symbols-outlined" style={{ color: action.color, fontSize: "24px" }}>{action.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569" }}>{action.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>
          {/* System Activity removed */}
        </div>
      </div>

      {/* Departmental Performance removed */}
    </div>
  )
}
