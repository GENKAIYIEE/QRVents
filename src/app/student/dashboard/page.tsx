import { Suspense } from "react"
import { getDashboardData } from "@/lib/student/dashboard-data"
import { StatCards } from "@/components/student/dashboard/StatCards"
import { UpcomingEventsList } from "@/components/student/dashboard/UpcomingEventsList"
import { RecentAttendance } from "@/components/student/dashboard/RecentAttendance"
import { StatCardsSkeleton } from "@/components/student/dashboard/skeletons/StatCardsSkeleton"
import { UpcomingEventsSkeleton } from "@/components/student/dashboard/skeletons/UpcomingEventsSkeleton"
import { RecentAttendanceSkeleton } from "@/components/student/dashboard/skeletons/RecentAttendanceSkeleton"
import { Toaster } from "sonner"
import { CalendarDays, History } from "lucide-react"

import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
}: {
  title: string
  subtitle?: string
  icon: any
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
            <Icon color="#3B82F6" size={18} />
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
      <div>{children}</div>
    </div>
  )
}

export default async function StudentDashboardPage() {
  const data = await getDashboardData()

  return (
    <StudentLayoutWrapper session={data.session} department={data.department} studentUser={data.studentUser}>
      <Toaster position="bottom-right" richColors />
      
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards 
          data={{
            upcomingEventsCount: data.upcomingEvents.length,
            eventsAttendedCount: data.attendanceCount,
            departmentsVisitedCount: data.distinctDeptsVisited,
            department: data.department
          }} 
        />
      </Suspense>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <Suspense fallback={
          <SectionCard title="Upcoming Events" subtitle="Events visible to you" icon={CalendarDays}>
            <div style={{ padding: "20px 24px" }}>
              <UpcomingEventsSkeleton />
            </div>
          </SectionCard>
        }>
          <SectionCard title="Upcoming Events" subtitle="Events visible to you" icon={CalendarDays}>
            <div style={{ padding: "20px 24px" }}>
              <UpcomingEventsList events={data.upcomingEvents} department={data.department} />
            </div>
          </SectionCard>
        </Suspense>

        <Suspense fallback={
          <SectionCard title="Recently Attended Events" subtitle="Your last 5 events" icon={History}>
            <RecentAttendanceSkeleton />
          </SectionCard>
        }>
          <SectionCard title="Recently Attended Events" subtitle="Your last 5 events" icon={History}>
            <RecentAttendance logs={data.recentAttendance} studentDepartmentId={data.department?.id || ""} />
          </SectionCard>
        </Suspense>
      </div>
    </StudentLayoutWrapper>
  )
}
