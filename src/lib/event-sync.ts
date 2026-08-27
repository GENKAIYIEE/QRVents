import prisma from "@/lib/prisma"
import { parse, isBefore, isAfter } from "date-fns"

/**
 * Lazy auto-sync for event statuses.
 * Transitions UPCOMING -> ONGOING when current time >= startTime
 * Transitions ONGOING -> COMPLETED when current time >= endTime
 */
export async function syncEventStatuses() {
  try {
    const { getManilaWallClock, getManilaCalendarToday } = await import("@/lib/time")
    const now = getManilaWallClock()
    
    // Find events that might need transitioning
    const events = await prisma.event.findMany({
      where: {
        status: { in: ["UPCOMING", "ONGOING"] }
      }
    })

    if (events.length === 0) return

    for (const event of events) {
      const eventDate = new Date(event.date)
      
      // Parse startTime and endTime on the eventDate
      // Format is HH:mm
      const [startHour, startMin] = event.startTime.split(":").map(Number)
      const [endHour, endMin] = event.endTime.split(":").map(Number)
      
      const startDateTime = new Date(eventDate)
      startDateTime.setHours(startHour, startMin, 0, 0)
      
      const endDateTime = new Date(eventDate)
      endDateTime.setHours(endHour, endMin, 0, 0)

      // Transition UPCOMING -> ONGOING
      if (event.status === "UPCOMING" && (isAfter(now, startDateTime) || now.getTime() === startDateTime.getTime()) && isBefore(now, endDateTime)) {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: "ONGOING" }
        })
      }
      
      // Transition UPCOMING or ONGOING -> COMPLETED
      if ((event.status === "UPCOMING" || event.status === "ONGOING") && (isAfter(now, endDateTime) || now.getTime() === endDateTime.getTime())) {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: "COMPLETED" }
        })
      }
    }
  } catch (error) {
    console.error("Failed to sync event statuses:", error)
  }
}
