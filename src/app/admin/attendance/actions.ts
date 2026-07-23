"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { AttendanceStatus } from "@prisma/client"

export async function getEventsForAttendance() {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  return await prisma.event.findMany({
    where: { 
      status: { in: ["ONGOING", "UPCOMING", "COMPLETED"] } 
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

export async function getAttendanceLogs(eventId: string, page = 1, pageSize = 50, search = "", status = "ALL", departmentId = "ALL") {
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
