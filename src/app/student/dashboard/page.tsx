import { Suspense } from "react"
import { getDashboardData } from "@/lib/student/dashboard-data"
import { StatCards } from "@/components/student/dashboard/StatCards"
import { UpcomingEventsList } from "@/components/student/dashboard/UpcomingEventsList"
import { RecentAttendance } from "@/components/student/dashboard/RecentAttendance"
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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-slate-50/50 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Icon color="#3B82F6" size={20} strokeWidth={2.5} />
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
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default async function StudentDashboardPage() {
  const data = await getDashboardData()

  // Separate events into Department and School-Wide
  const deptEvents = data.upcomingEvents.filter((e: any) => e.eventType === "DEPARTMENT")
  const schoolWideEvents = data.upcomingEvents.filter((e: any) => e.eventType === "SCHOOL_WIDE")

  return (
    <StudentLayoutWrapper 
      session={data.session} 
      department={data.department}
      studentUser={data.studentUser}
    >
      <div className="flex flex-col gap-6 w-full max-w-full pb-10">
        <StatCards data={{
          upcomingSchoolEventsCount: data.upcomingSchoolEventsCount,
          upcomingDeptEventsCount: data.upcomingDeptEventsCount,
          eventsAttendedCount: data.attendanceCount,
          departmentsVisitedCount: data.distinctDeptsVisited,
          department: data.department
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SectionCard
              title="Upcoming Department Events"
              subtitle="Events exclusive to your department"
              icon={CalendarDays}
            >
              <div className="p-5">
                <UpcomingEventsList 
                  events={deptEvents} 
                  department={data.department} 
                  emptyMessage="No upcoming department events." 
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Upcoming School-Wide Events"
              subtitle="Events open to the entire school"
              icon={CalendarDays}
            >
              <div className="p-5">
                <UpcomingEventsList 
                  events={schoolWideEvents} 
                  department={data.department} 
                  emptyMessage="No upcoming school-wide events." 
                />
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-1">
            <SectionCard
              title="Recent Attendance"
              subtitle="Events you recently checked into"
              icon={History}
            >
              <RecentAttendance logs={data.recentAttendance} studentDepartmentId={data.session.departmentId || ""} />
            </SectionCard>
          </div>
        </div>
      </div>
    </StudentLayoutWrapper>
  )
}
