import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ScannerClient } from "@/components/scanner/ScannerClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Scanner — QRVents Admin",
}

export default async function ScannerPage() {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login")

  // Fetch ONGOING events, or UPCOMING events starting today
  // Super Admin can scan ALL event types (school-wide and department)
  const { getManilaCalendarToday } = await import("@/lib/time")
  const todayStart = getManilaCalendarToday()
  
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCHours(23, 59, 59, 999)

  const rawEvents = await prisma.event.findMany({
    where: { 
      eventType: "SCHOOL_WIDE",
      OR: [
        { status: "ONGOING" },
        { 
          status: "UPCOMING",
          date: {
            gte: todayStart,
            lte: todayEnd
          }
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
      status: true,
    },
  })

  // We pass rawEvents directly. The ScannerClient (client component) will 
  // calculate the 45-minute window using the browser's local timezone.
  const events = rawEvents

  // Fetch global settings for auto-lock timer
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  })
  
  const autoLockSeconds = settings?.defaultScanDuration ?? 120

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-10">
      <ScannerClient events={events} autoLockSeconds={autoLockSeconds} basePath="Admin" />
    </div>
  )
}
