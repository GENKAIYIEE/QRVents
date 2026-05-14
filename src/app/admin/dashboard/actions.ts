"use server"

import prisma from "@/lib/prisma"

export async function getDashboardStats() {
  const [
    totalStudents,
    totalDeptAdmins,
    upcomingEvents,
    pendingProposals,
    onHoldProposals,
    totalEvents,
    departments,
    recentProposals,
    recentActivity,
    upcomingEventsList,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "DEPT_ADMIN", isActive: true } }),
    prisma.event.count({ where: { status: "COMPLETED" } }),
    prisma.eventProposal.count({ where: { status: "PENDING" } }),
    prisma.eventProposal.count({ where: { status: "ON_HOLD" } }),
    prisma.event.count(),
    prisma.department.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
        lightBg: true,
        _count: {
          select: {
            users: { where: { role: "STUDENT" } },
            events: true,
          },
        },
      },
      orderBy: { code: "asc" },
    }),
    prisma.eventProposal.findMany({
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: {
        department: { select: { code: true, color: true } },
        submittedBy: { select: { fullName: true } },
      },
    }),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.event.findMany({
      where: { status: "UPCOMING" },
      orderBy: { date: "asc" },
      take: 4,
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        startTime: true,
      },
    }),
  ])

  // Events per department
  const eventsPerDept = await prisma.event.groupBy({
    by: ["departmentId"],
    _count: { _all: true },
    where: { departmentId: { not: null } },
  })

  // Attendance summary per department (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const attendanceByDept = await prisma.attendanceLog.groupBy({
    by: ["userId"],
    _count: { _all: true },
    where: { checkIn: { gte: thirtyDaysAgo } },
  })

  // Monthly trend: events per month (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const eventsThisYear = await prisma.event.findMany({
    where: { date: { gte: sixMonthsAgo } },
    select: { date: true, status: true },
    orderBy: { date: "asc" },
  })

  return {
    totalStudents,
    totalDeptAdmins,
    finishedEvents: upcomingEvents, // Renamed in return for clarity
    pendingProposals,
    onHoldProposals,
    totalEvents,
    departments,
    eventsPerDept,
    recentProposals,
    recentActivity,
    attendanceCount: attendanceByDept.length,
    eventsThisYear,
    upcomingEventsList,
  }
}
