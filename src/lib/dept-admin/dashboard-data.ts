import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { COOKIE_NAME } from "@/lib/constants"

const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function getDeptLayoutData() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) redirect("/login")

  let payload: { userId?: string; role?: string; email?: string }
  try {
    const verified = await jwtVerify(token!, secretKey)
    payload = verified.payload as typeof payload
  } catch {
    redirect("/login")
  }

  if (payload!.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: payload!.userId },
    select: { id: true, fullName: true, email: true, role: true, departmentId: true },
  })

  if (!user || !user.departmentId) redirect("/login")

  const department = await prisma.department.findUnique({
    where: { id: user.departmentId },
  })

  if (!department) redirect("/login")

  const session = {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    departmentId: user.departmentId,
  }

  const unreadNotifications = await prisma.notification.count({
    where: { userId: user.id, isRead: false }
  })

  return { session, department, unreadNotifications }
}

export async function getDashboardData() {
  const { session, department } = await getDeptLayoutData()
  const { getManilaCalendarToday } = await import("@/lib/time")
  const todayCalendar = getManilaCalendarToday()

  const [
    studentCount,
    activeEventsCount,
    completedEventsCount,
    upcomingEvents,
    recentCompletedEvents,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", departmentId: department.id } }),
    
    // Active Events (Ongoing)
    prisma.event.count({
      where: {
        departmentId: department.id,
        status: "ONGOING"
      }
    }),

    // Completed Events
    prisma.event.count({
      where: {
        departmentId: department.id,
        status: "COMPLETED"
      }
    }),

    // Upcoming Events Feed
    prisma.event.findMany({
      where: {
        date: { gte: todayCalendar },
        status: "UPCOMING",
        departmentId: department.id,
      },
      orderBy: { date: "asc" },
      take: 4,
    }),

    // Top 3 Recent Completed Events with Attendance Logs
    prisma.event.findMany({
      where: {
        status: "COMPLETED",
        departmentId: department.id,
      },
      orderBy: [
        { date: "desc" },
        { endTime: "desc" }
      ],
      take: 3,
      include: {
        _count: {
          select: { attendanceLogs: true }
        }
      }
    })
  ])

  // Calculate Average Attendance Rate across recent events
  let totalExpected = 0
  let totalAttended = 0
  recentCompletedEvents.forEach(event => {
    // If expectedAttendees is null, assume total students in dept
    const expected = event.expectedAttendees || studentCount || 1 
    totalExpected += expected
    totalAttended += event._count.attendanceLogs
  })
  
  const avgAttendanceRate = totalExpected > 0 ? Math.round((totalAttended / totalExpected) * 100) : 0

  return {
    session,
    department,
    deptName: department.name,
    studentCount,
    activeEventsCount,
    completedEventsCount,
    avgAttendanceRate,
    upcomingEvents,
    recentCompletedEvents
  }
}
