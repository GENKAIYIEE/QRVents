"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { AttendanceStatus } from "@prisma/client"

export async function getEventsForAttendance() {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  return await prisma.event.findMany({
    where: { 
      eventType: "SCHOOL_WIDE",
      OR: [
        { status: { in: ["ONGOING", "UPCOMING"] } },
        { 
          status: "COMPLETED",
          date: { gte: todayStart, lte: todayEnd }
        }
      ]
    },
    orderBy: [
      { status: "asc" }, // ONGOING first
      { date: "desc" }
    ],
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      date: true,
      department: { select: { code: true } }
    }
  })
}

export async function getAttendanceLogs(
  eventId: string, 
  page = 1, 
  pageSize = 50, 
  search = "", 
  status = "ALL", 
  departmentId = "ALL",
  yearLevel = "ALL",
  section = "ALL"
) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const whereClause: any = {
    eventId,
    user: {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { studentId: { contains: search, mode: "insensitive" } }
      ]
    }
  }

  if (status !== "ALL") {
    whereClause.status = status as AttendanceStatus
  }

  if (departmentId !== "ALL") {
    whereClause.user.departmentId = departmentId
  }

  if (yearLevel !== "ALL") {
    whereClause.user.yearLevel = yearLevel
  }

  if (section !== "ALL") {
    whereClause.user.section = { equals: section, mode: "insensitive" }
  }

  const [logs, total, groupBy] = await Promise.all([
    prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: [
        { checkIn: "desc" },
        { id: "desc" }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            fullName: true,
            studentId: true,
            yearLevel: true,
            section: true,
            department: { select: { code: true, color: true } }
          }
        }
      }
    }),
    prisma.attendanceLog.count({ where: whereClause }),
    prisma.attendanceLog.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true
    })
  ]);

  const stats = {
    total: groupBy.reduce((acc, curr) => acc + curr._count, 0),
    present: groupBy.find(g => g.status === "PRESENT")?._count || 0,
    checkedOut: groupBy.find(g => g.status === "CHECKED_OUT")?._count || 0,
    guest: groupBy.find(g => g.status === "GUEST")?._count || 0,
  }

  return { logs, total, pages: Math.ceil(total / pageSize), stats }
}
