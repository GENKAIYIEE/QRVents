"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function getEventDetails(eventId: string) {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, date: true, status: true, departmentId: true, eventType: true }
  })

  if (!event) throw new Error("Event not found")
  
  return event
}

export async function getEventStatistics(eventId: string) {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") {
    throw new Error("Unauthorized")
  }

  const logs = await prisma.attendanceLog.findMany({
    where: { eventId },
    include: {
      user: {
        select: { yearLevel: true, section: true }
      }
    }
  })

  const yearStats: Record<string, number> = {}
  const sectionStats: Record<string, number> = {}

  logs.forEach(log => {
    const year = log.user.yearLevel || "Unknown"
    const section = log.user.section || "Unknown"
    
    yearStats[year] = (yearStats[year] || 0) + 1
    sectionStats[section] = (sectionStats[section] || 0) + 1
  })

  return {
    total: logs.length,
    byYear: Object.entries(yearStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    bySection: Object.entries(sectionStats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }
}

export async function getEventAttendees(eventId: string, page = 1, pageSize = 10, yearLevel = "ALL", section = "ALL", search = "") {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") {
    throw new Error("Unauthorized")
  }

  const userWhereClause: any = {}
  
  if (yearLevel && yearLevel !== "ALL") {
    userWhereClause.yearLevel = yearLevel
  }

  if (section && section !== "ALL") {
    userWhereClause.section = section
  }

  if (search) {
    userWhereClause.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { studentId: { contains: search, mode: "insensitive" } }
    ]
  }

  const whereClause: any = {
    eventId,
    user: userWhereClause
  }

  const [logs, total] = await Promise.all([
    prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: { checkIn: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            yearLevel: true,
            section: true,
            department: { select: { code: true, color: true } }
          }
        }
      }
    }),
    prisma.attendanceLog.count({ where: whereClause })
  ])

  return { logs, total, pages: Math.ceil(total / pageSize) }
}
