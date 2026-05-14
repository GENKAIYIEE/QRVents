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
  const now = new Date()

  const [
    upcomingEvents,
    attendanceCount,
    recentAttendance,
    distinctDeptsResult,
    department,
    studentUser
  ] = await Promise.all([
    // All upcoming events visible to this student
    prisma.event.findMany({
      where: {
        date: { gte: now },
        OR: [
          { eventType: "SCHOOL_WIDE" },
          ...(departmentId ? [{ departmentId: departmentId }] : []),
        ],
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { department: true }
    }),

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

    // Student user info
    prisma.user.findUnique({ where: { id: studentId } })
  ])

  // Count distinct department IDs (filtering out own department or nulls)
  const distinctDeptIds = new Set(
    distinctDeptsResult
      .map((log) => log.event.departmentId)
      .filter((id) => id !== null && id !== departmentId)
  )

  return {
    upcomingEvents,
    attendanceCount,
    recentAttendance,
    distinctDeptsVisited: distinctDeptIds.size,
    department,
    session,
    studentUser
  }
}
