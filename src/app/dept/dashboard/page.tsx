import { Suspense } from "react"
import { Toaster } from "sonner"
import { getDashboardData } from "@/lib/dept-admin/dashboard-data"
import Link from "next/link"
import { format } from "date-fns"

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

export default async function DeptAdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <Toaster position="bottom-right" richColors />
      
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
          icon="groups"
          label="Total Students"
          value={data.studentCount.toLocaleString()}
          sub="Registered in dept"
          color={data.department.color || "#3B82F6"}
          bg={(data.department.color || "#3B82F6") + "15"}
          trend={{ dir: "up", text: "Active" }}
        />
        <StatCard
          icon="calendar_month"
          label="Upcoming Events"
          value={data.upcomingEvents.length}
          sub="School & dept events"
          color="#8B5CF6"
          bg="#F5F3FF"
          trend={data.upcomingEvents.length > 0 ? { dir: "up", text: "Scheduled" } : { dir: "neutral", text: "None" }}
        />
        <StatCard
          icon="schedule"
          label="Pending Proposals"
          value={data.pendingCount}
          sub="Awaiting approval"
          color="#F59E0B"
          bg="#FFFBEB"
          trend={data.pendingCount > 0 ? { dir: "down", text: "Action Needed" } : { dir: "neutral", text: "Cleared" }}
        />
        <StatCard
          icon="verified"
          label="Approved Proposals"
          value={data.approvedCount}
          sub="Ready for launch"
          color="#10B981"
          bg="#ECFDF5"
          trend={data.approvedCount > 0 ? { dir: "up", text: "Recent" } : { dir: "neutral", text: "No approvals" }}
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
        {/* ── Left Column ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: 0 }}>
          <SectionCard
            title="Upcoming Events"
            subtitle="Events relevant to your department"
            icon="event"
            action={
              <Link href="/dept/events" style={{ color: "#3B82F6", fontSize: "12px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                View all <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
              </Link>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.upcomingEvents.length > 0 ? (
                data.upcomingEvents.map((event: any) => (
                  <div key={event.id} style={{ padding: "14px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{event.title}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, background: event.eventType === "SCHOOL_WIDE" ? "#DBEAFE" : (data.department.color + "20"), color: event.eventType === "SCHOOL_WIDE" ? "#1E40AF" : data.department.color, padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase" }}>{event.eventType === "SCHOOL_WIDE" ? "School Wide" : "Department"}</div>
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
                <div style={{ height: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#CBD5E1", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>event_busy</span>
                  <span style={{ fontSize: "13px" }}>No upcoming events</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Recent Students"
            subtitle={`Newly registered in ${data.department.name}`}
            icon="group"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.recentStudents.length > 0 ? (
                data.recentStudents.map((student: any, i: number) => (
                  <div key={i} style={{ padding: "12px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: data.department.color + "20", color: data.department.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold" }}>
                      {student.fullName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{student.fullName}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>{student.yearLevel}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>
                      {format(new Date(student.createdAt), "MMM d")}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ height: "120px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#CBD5E1", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>group_off</span>
                  <span style={{ fontSize: "13px" }}>No students registered yet</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Right Column ───────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <SectionCard title="Quick Actions" subtitle="Common tasks" icon="bolt">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Propose Event", icon: "send", color: "#3B82F6", href: "/dept/proposals" },
                { label: "Scanner", icon: "qr_code_scanner", color: "#8B5CF6", href: "/dept/scanner" },
                { label: "Attendance", icon: "wifi_tethering", color: "#10B981", href: "/dept/attendance" },
                { label: "Reports", icon: "bar_chart", color: "#F59E0B", href: "/dept/reports" },
              ].map((action) => (
                <a key={action.label} href={action.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "16px", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: "12px", cursor: "pointer", transition: "all 200ms ease", textDecoration: "none" }}>
                  <span className="material-symbols-outlined" style={{ color: action.color, fontSize: "24px" }}>{action.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#475569", textAlign: "center" }}>{action.label}</span>
                </a>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Recent Proposals"
            subtitle="Status of submitted proposals"
            icon="assignment"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.recentProposals.length > 0 ? (
                data.recentProposals.map((proposal: any) => (
                  <div key={proposal.id} style={{ padding: "12px", borderRadius: "12px", background: "#F8FAFC", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>{proposal.title}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <div style={{ fontSize: "10px", color: "#94A3B8" }}>{format(new Date(proposal.submittedAt), "MMM d, yyyy")}</div>
                      <div style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: proposal.status === "PENDING" ? "#FEF3C7" : proposal.status === "APPROVED" ? "#D1FAE5" : "#FEE2E2", color: proposal.status === "PENDING" ? "#92400E" : proposal.status === "APPROVED" ? "#065F46" : "#991B1B", textTransform: "uppercase" }}>{proposal.status}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ height: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#CBD5E1", gap: "8px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>assignment_turned_in</span>
                  <span style={{ fontSize: "12px" }}>No recent proposals</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
