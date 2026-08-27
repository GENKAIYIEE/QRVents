import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ScannerClient } from "@/components/scanner/ScannerClient"

export const metadata: Metadata = {
  title: "Scanner — QRVents Admin",
}

export default async function ScannerPage() {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") redirect("/login")

  // Fetch ONGOING events, or UPCOMING events starting today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

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

  const now = new Date()
  
  // Filter UPCOMING events to only those starting within 45 minutes
  const events = rawEvents.filter(event => {
    if (event.status === "ONGOING") return true;
    if (event.status === "UPCOMING" && event.startTime) {
      const [startHours, startMinutes] = event.startTime.split(":").map(Number);
      const eventStartDate = new Date(event.date);
      eventStartDate.setHours(startHours, startMinutes, 0, 0);
      const timeDiffMinutes = (eventStartDate.getTime() - now.getTime()) / (1000 * 60);
      return timeDiffMinutes <= 45;
    }
    return false;
  })

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
