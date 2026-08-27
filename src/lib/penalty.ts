import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"

export async function getPenaltySettings() {
  let settings = await prisma.penaltySettings.findFirst()

  if (!settings) {
    settings = await prisma.penaltySettings.create({
      data: {
        defaultDeadlineDays: 7,
        defaultFee: 100,
        defaultServiceHours: 2,
        overdueFeeIncrease: 50,
        overdueHoursIncrease: 1,
      },
    })
  }

  return settings
}

// ─────────────────────────────
// Checks if a given check-in
// time is late relative to the
// event's start time string.
// Returns true if checkIn was
// more than 30 minutes after
// startTime.
// ─────────────────────────────

export function isCheckInLate(
  checkInDate: Date,
  eventStartTime: string,  // "HH:MM" format
  eventDate: Date,
  graceMinutes: number = 30
): boolean {
  try {
    const [hours, minutes] = eventStartTime.split(":").map(Number)
    const startDateTime = new Date(eventDate)
    startDateTime.setHours(hours, minutes, 0, 0)

    const diffMs = checkInDate.getTime() - startDateTime.getTime()
    const diffMinutes = diffMs / (1000 * 60)
    return diffMinutes > graceMinutes
  } catch {
    return false
  }
}

// ─────────────────────────────
// Get the list of students who 
// were expected to attend but 
// did not check in
// ─────────────────────────────

export async function getMissingAttendees(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { attendanceLogs: true },
  })

  if (!event) {
    throw new Error("Event not found")
  }

  // Define the end of the event day to ensure students who registered on the day of the event are included
  const eventEndOfDay = new Date(event.date)
  eventEndOfDay.setHours(23, 59, 59, 999)

  const expectedStudents = 
  event.eventType === "SCHOOL_WIDE"
    ? await prisma.user.findMany({
        where: { 
          role: "STUDENT", 
          isActive: true,
          createdAt: { lte: eventEndOfDay }
        },
        select: { id: true },
      })
    : await prisma.user.findMany({
        where: {
          role: "STUDENT",
          isActive: true,
          departmentId: event.departmentId,
          createdAt: { lte: eventEndOfDay }
        },
        select: { id: true },
      })

  // Students who checked in with 
  // status PRESENT (guests are 
  // never expected, so they're 
  // naturally excluded since they 
  // belong to a different dept)
  const attendedIds = new Set(
    event.attendanceLogs
      .filter((log) => log.status === "PRESENT")
      .map((log) => log.userId)
  )

  const missingStudentIds = expectedStudents
    .map((s) => s.id)
    .filter((id) => !attendedIds.has(id))

  return missingStudentIds
}

// ─────────────────────────────
// Generate penalty records for 
// students who:
//  1. Were ABSENT (no show)
//  2. Did not CHECK OUT
//  3. Were LATE + did not check out
//     (upgrades existing LATE penalty)
// ─────────────────────────────

export async function generatePenaltiesForEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { attendanceLogs: true },
  })

  if (!event) {
    throw new Error("Event not found")
  }

  if (!event.isMandatory) {
    return { 
      generated: 0, 
      skipped: true,
      reason: "Event is not mandatory" 
    }
  }

  const settings = await getPenaltySettings()
  const deadline = addDays(new Date(), settings.defaultDeadlineDays)

  let totalGenerated = 0
  const affectedStudentIds: string[] = []

  // ── 1. ABSENT: Students who never showed up ──
  const missingStudentIds = await getMissingAttendees(eventId)

  if (missingStudentIds.length > 0) {
    const result = await prisma.penalty.createMany({
      data: missingStudentIds.map((studentId) => ({
        studentId,
        eventId,
        reason: "ABSENT",
        feeAmount: settings.defaultFee,
        serviceHours: settings.defaultServiceHours,
        deadline,
        status: "PENDING" as const,
      })),
      skipDuplicates: true,
    })

    totalGenerated += result.count
    affectedStudentIds.push(...missingStudentIds)

    // Notify absent students
    await prisma.notification.createMany({
      data: missingStudentIds.map((studentId) => ({
        userId: studentId,
        title: "Attendance Penalty — Absent",
        message: `You were absent from the mandatory event "${event.title}". A penalty has been issued. Please resolve it before the deadline.`,
        type: "PENALTY",
      })),
      skipDuplicates: true,
    })
  }

  // ── 2. NO_CHECKOUT: Present students who never scanned out ──
  const noCheckoutLogs = event.attendanceLogs.filter(
    (log) => log.status === "PRESENT" && !log.checkOut
  )

  for (const log of noCheckoutLogs) {
    // Check if this student already has a LATE penalty (issued at scan time)
    const existingPenalty = await prisma.penalty.findUnique({
      where: { studentId_eventId: { studentId: log.userId, eventId } },
    })

    if (existingPenalty) {
      // Upgrade LATE → LATE_AND_NO_CHECKOUT
      if (existingPenalty.reason === "LATE") {
        await prisma.penalty.update({
          where: { id: existingPenalty.id },
          data: { reason: "LATE_AND_NO_CHECKOUT" },
        })

        await prisma.notification.create({
          data: {
            userId: log.userId,
            title: "Penalty Updated — Late & No Checkout",
            message: `Your penalty for "${event.title}" has been updated: you were both late and did not check out.`,
            type: "PENALTY",
          },
        })
      }
      // If already ABSENT or LATE_AND_NO_CHECKOUT, skip
    } else {
      // Create a fresh NO_CHECKOUT penalty
      await prisma.penalty.create({
        data: {
          studentId: log.userId,
          eventId,
          reason: "NO_CHECKOUT",
          feeAmount: settings.defaultFee,
          serviceHours: settings.defaultServiceHours,
          deadline,
          status: "PENDING",
        },
      })

      totalGenerated++
      affectedStudentIds.push(log.userId)

      await prisma.notification.create({
        data: {
          userId: log.userId,
          title: "Attendance Penalty — No Check-Out",
          message: `You did not scan out at the mandatory event "${event.title}". A penalty has been issued. Please resolve it before the deadline.`,
          type: "PENALTY",
        },
      })
    }
  }

  return { 
    generated: totalGenerated,
    skipped: false,
    studentIds: affectedStudentIds,
  }
}

// ─────────────────────────────
// Check and auto-escalate overdue 
// penalties (call this whenever 
// penalties are fetched/listed)
// ─────────────────────────────

export async function escalateOverduePenalties() {
  const settings = await getPenaltySettings()

  const now = new Date()

  const overdueButStillPending = await prisma.penalty.findMany({
    where: {
      status: "PENDING",
      deadline: { lt: now },
    },
  })

  if (overdueButStillPending.length === 0) {
    return { escalated: 0 }
  }

  for (const penalty of overdueButStillPending) {
    await prisma.penalty.update({
      where: { id: penalty.id },
      data: {
        status: "OVERDUE",
        feeAmount: penalty.feeAmount + settings.overdueFeeIncrease,
        serviceHours: penalty.serviceHours + settings.overdueHoursIncrease,
      },
    })
  }

  return { 
    escalated: overdueButStillPending.length 
  }
}

