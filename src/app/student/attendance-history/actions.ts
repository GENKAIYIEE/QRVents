"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { Prisma } from "@prisma/client"

export async function getStudentAttendanceHistory(
  page = 1,
  limit = 10,
  search = "",
  typeFilter = "ALL",
  statusFilter = "ALL" // New filter
) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  const studentId = session.userId
  const skip = (page - 1) * limit
  
  const user = await prisma.user.findUnique({ where: { id: studentId } })
  const deptId = user?.departmentId

  const { getManilaCalendarToday, getManilaCalendarDateFromTimestamp } = await import("@/lib/time")
  
  const today = getManilaCalendarToday()
  const now = new Date() // Absolute UTC time for comparing with event.date ?
  
  // Wait, `now` is used in `date: { lte: now }`.
  // But `event.date` is a Calendar Date (midnight UTC).
  // If we query `date: { lte: now }`, and now is `2026-08-27T01:00:00Z` and event.date is `2026-08-27T00:00:00Z`, it includes today's events!
  // This is correct.
  
  const userCreatedAt = user?.createdAt || new Date()
  const userCreationStartOfDay = getManilaCalendarDateFromTimestamp(userCreatedAt)

  // Build the Where clause for Events
  // Only show past events (date <= now).
  const where: Prisma.EventWhereInput = {
    date: { lte: now },
    AND: [
      {
        OR: [
          { date: { gte: userCreationStartOfDay } },
          { attendanceLogs: { some: { userId: studentId } } }
        ]
      }
    ]
  }

  // Prevent "Fake Missed Events": Do not show ONGOING events from TODAY if the student hasn't attended yet.
  ;(where.AND as any[]).push({
    OR: [
      { status: { not: "ONGOING" } },
      { date: { lt: today } },
      { attendanceLogs: { some: { userId: studentId } } }
    ]
  })

  if (search) {
    ;(where.AND as any[]).push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } }
      ]
    })
  }

  if (typeFilter !== "ALL") {
    ;(where.AND as any[]).push({
      eventType: typeFilter as any
    })
  }

  const applicableEventsCondition = {
    OR: [
      { eventType: "SCHOOL_WIDE" },
      ...(deptId ? [{ departmentId: deptId }] : [])
    ]
  }

  if (statusFilter === "ATTENDED") {
    ;(where.AND as any[]).push({
      attendanceLogs: { some: { userId: studentId } }
    })
  } else if (statusFilter === "MISSED") {
    ;(where.AND as any[]).push(applicableEventsCondition)
    ;(where.AND as any[]).push({
      attendanceLogs: { none: { userId: studentId } }
    })
  } else {
    // ALL statuses: Either applicable to student, OR they attended it (as a guest)
    ;(where.AND as any[]).push({
      OR: [
        ...applicableEventsCondition.OR,
        { attendanceLogs: { some: { userId: studentId } } }
      ]
    })
  }

  if ((where.AND as any[]).length === 0) {
    delete where.AND
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        department: true,
        attendanceLogs: {
          where: { userId: studentId }
        }
      },
      orderBy: [
        { date: "desc" },
        { endTime: "desc" }
      ],
      skip,
      take: limit,
    }),
    prisma.event.count({ where })
  ])

  // Map to unified format
  const logs = events.map(event => {
    const log = event.attendanceLogs[0]
    if (log) {
      return {
        id: log.id,
        checkIn: log.checkIn,
        checkOut: log.checkOut,
        status: log.status,
        event: {
          id: event.id,
          title: event.title,
          venue: event.venue,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          eventType: event.eventType,
          status: event.status,
          hasCertificate: event.hasCertificate,
          department: event.department
        }
      }
    } else {
      return {
        id: `missed-${event.id}`,
        checkIn: null,
        checkOut: null,
        status: "MISSED",
        event: {
          id: event.id,
          title: event.title,
          venue: event.venue,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          eventType: event.eventType,
          status: event.status,
          hasCertificate: event.hasCertificate,
          department: event.department
        }
      }
    }
  })

  return {
    logs,
    total,
    pages: Math.ceil(total / limit)
  }
}
