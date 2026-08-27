import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ScannerClient } from "@/components/scanner/ScannerClient"

import { UpcomingEventsPrompt } from "@/components/dept/upcoming-events-prompt"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Scanner — QRVents Dept Admin",
}

export default async function DeptScannerPage() {
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

  const rawEvents = await prisma.event.findMany({
    where: { 
      OR: [
        { status: "ONGOING" },
        { 
          status: "UPCOMING",
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
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      date: true,
      venue: true,
      startTime: true,
      endTime: true,
      status: true,
      eventType: true
    },
  })

  const now = new Date()
  const events: typeof rawEvents = []
  const upcomingEventsToday: typeof rawEvents = []

  rawEvents.forEach(event => {
    if (event.status === "ONGOING") {
      events.push(event)
    } else if (event.status === "UPCOMING" && event.startTime) {
      const [startHours, startMinutes] = event.startTime.split(":").map(Number);
      const eventStartDate = new Date(event.date);
      eventStartDate.setHours(startHours, startMinutes, 0, 0);
      const timeDiffMinutes = (eventStartDate.getTime() - now.getTime()) / (1000 * 60);
      
      if (timeDiffMinutes <= 45) {
        events.push(event)
      } else {
        upcomingEventsToday.push(event)
      }
    }
  })

  // Fetch global settings for auto-lock timer
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  })
  
  const autoLockSeconds = settings?.defaultScanDuration ?? 120

  if (events.length === 0 && upcomingEventsToday.length > 0) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto pb-10 flex items-center justify-center px-4">
         <UpcomingEventsPrompt events={upcomingEventsToday} />
      </div>
    )
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-10">
      <ScannerClient events={events} autoLockSeconds={autoLockSeconds} basePath="Department" />
    </div>
  )
}
