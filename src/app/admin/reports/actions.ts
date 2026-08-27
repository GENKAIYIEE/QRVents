"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { subDays, startOfDay, endOfDay } from "date-fns"

export async function getReportsData(startDateParam?: string, endDateParam?: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  // Default to last 30 days if no dates provided
  const endDate = endDateParam ? endOfDay(new Date(endDateParam)) : endOfDay(new Date())
  const startDate = startDateParam ? startOfDay(new Date(startDateParam)) : startOfDay(subDays(new Date(), 30))

  const dateFilter = {
    gte: startDate,
    lte: endDate
  }

  const [
    totalEvents,
    eventsList,
    totalAttendance,
    attendanceByDeptRaw,
    eventsByDeptRaw
  ] = await Promise.all([
    prisma.event.count({ where: { date: dateFilter } }),
    prisma.event.findMany({
      where: { date: dateFilter },
      orderBy: [
        { date: "desc" },
        { endTime: "desc" }
      ],
      select: {
        id: true,
        title: true,
        date: true,
        eventType: true,
        expectedAttendees: true,
        department: { select: { code: true } },
        _count: { select: { attendanceLogs: true } }
      }
    }),
    prisma.attendanceLog.count({ where: { checkIn: dateFilter } }),
    prisma.attendanceLog.groupBy({
      by: ["eventId"], // We have to link to event->dept or user->dept. Prisma groupBy relations is limited, let's just query departments with relations
    }),
    prisma.event.groupBy({
      by: ["departmentId"],
      _count: { _all: true },
      where: { date: dateFilter, departmentId: { not: null } }
    })
  ])

  // Better way to get attendance by department:
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      code: true,
      color: true,
      name: true,
      _count: {
        select: {
          users: true,
          events: { where: { date: dateFilter } }
        }
      }
    }
  })

  // We need to count attendance logs where user belongs to the department in the date range
  const deptAttendanceCounts = await Promise.all(
    departments.map(async (dept) => {
      const count = await prisma.attendanceLog.count({
        where: {
          checkIn: dateFilter,
          user: { departmentId: dept.id }
        }
      })
      return {
        ...dept,
        attendanceCount: count
      }
    })
  )

  return {
    summary: {
      totalEvents,
      totalAttendance,
      avgAttendancePerEvent: totalEvents > 0 ? Math.round(totalAttendance / totalEvents) : 0,
    },
    eventsList,
    departments: deptAttendanceCounts
  }
}
