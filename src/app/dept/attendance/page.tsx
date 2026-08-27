import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { AttendanceClient } from "./attendance-client"

import { UpcomingEventsPrompt } from "@/components/dept/upcoming-events-prompt"

export const metadata: Metadata = {
  title: "Live Attendance — QRVents Dept Admin",
}

export default async function DeptAttendancePage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Fetch ONGOING, UPCOMING, and today's COMPLETED events that the dept admin can view
  const activeEvents = await prisma.event.findMany({
    where: { 
      OR: [
        { status: { in: ["ONGOING", "UPCOMING"] } },
        { 
          status: "COMPLETED",
          date: { gte: todayStart, lte: todayEnd }
        }
      ],
      AND: [
        {
          OR: [
            { departmentId: user?.departmentId },
            { eventType: "SCHOOL_WIDE" }
          ]
        }
      ]
    },
    orderBy: [
      { status: "asc" },
      { date: "desc" }
    ],
    select: {
      id: true,
      title: true,
      expectedAttendees: true,
    }
  })



  const upcomingEventsToday = activeEvents.length === 0 
    ? await prisma.event.findMany({
        where: {
          status: "UPCOMING",
          date: { gte: todayStart, lte: todayEnd },
          OR: [
            { departmentId: user?.departmentId },
            { eventType: "SCHOOL_WIDE" }
          ]
        },
        select: {
          id: true, title: true, date: true, startTime: true, endTime: true, venue: true, eventType: true
        }
      })
    : []

  // Get initial attendance logs for these active events
  const initialLogs = await prisma.attendanceLog.findMany({
    where: {
      eventId: { in: activeEvents.map(e => e.id) }
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { fullName: true, studentId: true, departmentId: true }
      },
      event: {
        select: { title: true }
      }
    },
    take: 50 // recent 50 logs for initial render
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="relative flex h-4 w-4 mt-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
          Live Attendance
        </h1>
        <p className="text-slate-500 mt-1">Real-time monitoring of campus entries and event attendance.</p>
      </div>

      {activeEvents.length === 0 ? (
        upcomingEventsToday.length > 0 ? (
          <UpcomingEventsPrompt events={upcomingEventsToday} />
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">videocam_off</span>
            <h3 className="text-lg font-bold text-slate-700">No Ongoing Events</h3>
            <p className="text-slate-500 text-sm mt-1">There are no active events currently being scanned.</p>
          </div>
        )
      ) : (
        <AttendanceClient 
          activeEvents={activeEvents} 
          initialLogs={initialLogs as any} 
          departmentId={user?.departmentId!} 
        />
      )}
    </div>
  )
}
