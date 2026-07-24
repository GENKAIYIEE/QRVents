import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getDashboardData() {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    redirect("/login")
  }

  const studentId = session.userId
  const departmentId = session.departmentId
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    upcomingSchoolWideEvents,
    upcomingDeptEvents,
    upcomingSchoolEventsCount,
    upcomingDeptEventsCount,
    attendanceCount,
    recentAttendance,
    distinctDeptsResult,
    department,
    studentUser
  ] = await Promise.all([
    // Upcoming school-wide events
    prisma.event.findMany({
      where: {
        date: { gte: today },
        eventType: "SCHOOL_WIDE",
        status: { in: ["UPCOMING", "ONGOING"] }
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { department: true }
    }),

    // Upcoming department events
    departmentId ? prisma.event.findMany({
      where: {
        date: { gte: today },
        eventType: "DEPARTMENT",
        departmentId: departmentId,
        status: { in: ["UPCOMING", "ONGOING"] }
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { department: true }
    }) : Promise.resolve([]),

    // Count of upcoming school-wide events
    prisma.event.count({
      where: {
        date: { gte: today },
        eventType: "SCHOOL_WIDE",
        status: { in: ["UPCOMING", "ONGOING"] }
      }
    }),

    // Count of upcoming department events
    departmentId ? prisma.event.count({
      where: {
        date: { gte: today },
        eventType: "DEPARTMENT",
        departmentId: departmentId,
        status: { in: ["UPCOMING", "ONGOING"] }
      }
    }) : Promise.resolve(0),

    // Total events attended count
    prisma.attendanceLog.count({
      where: { userId: studentId },
    }),

    // Last 5 attended events with event details
    prisma.attendanceLog.findMany({
      where: { userId: studentId },
      orderBy: { checkIn: "desc" },
      take: 5,
      include: { event: { include: { department: true } } },
    }),

    // Distinct departments visited (for guest attendance count)
    prisma.attendanceLog.findMany({
      where: { userId: studentId },
      select: { event: { select: { departmentId: true } } },
      distinct: ["eventId"],
    }),

    // Department info for color theming
    departmentId ? prisma.department.findUnique({ where: { id: departmentId } }) : null,

    // Student user info with unread notifications and unpaid penalties counts
    prisma.user.findUnique({
      where: { id: studentId },
      include: {
        _count: {
          select: {
            notifications: { where: { isRead: false } },
            penalties: { where: { status: { in: ["PENDING", "OVERDUE"] } } }
          }
        }
      }
    })
  ])

  // Count distinct department IDs (filtering out own department or nulls)
  const distinctDeptIds = new Set(
    distinctDeptsResult
      .map((log) => log.event.departmentId)
      .filter((id) => id !== null && id !== departmentId)
  )

  const upcomingEvents = [...upcomingSchoolWideEvents, ...upcomingDeptEvents];

  return {
    upcomingEvents,
    upcomingSchoolEventsCount,
    upcomingDeptEventsCount,
    attendanceCount,
    recentAttendance,
    distinctDeptsVisited: distinctDeptIds.size,
    department,
    session,
    studentUser
  }
}
