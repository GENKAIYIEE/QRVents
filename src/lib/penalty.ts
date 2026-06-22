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

  // Determine expected attendees scope
  const expectedStudents = 
  event.eventType === "SCHOOL_WIDE"
    ? await prisma.user.findMany({
        where: { role: "STUDENT" },
        select: { id: true },
      })
    : await prisma.user.findMany({
        where: {
          role: "STUDENT",
          departmentId: event.departmentId,
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
// every student who missed a 
// mandatory event
// ─────────────────────────────

export async function generatePenaltiesForEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
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

  const missingStudentIds = await getMissingAttendees(eventId)

  if (missingStudentIds.length === 0) {
    return { 
      generated: 0, 
      skipped: false,
      reason: "No students missed this event" 
    }
  }

  const settings = await getPenaltySettings()

  const deadline = addDays(
    new Date(),
    settings.defaultDeadlineDays
  )

  // Use createMany with skipDuplicates 
  // to respect the @@unique constraint 
  // — prevents double-generation if 
  // this function runs twice
  const result = await prisma.penalty.createMany({
    data: missingStudentIds.map(
      (studentId) => ({
        studentId,
        eventId,
        feeAmount: settings.defaultFee,
        serviceHours: settings.defaultServiceHours,
        deadline,
        status: "PENDING" as const,
      })
    ),
    skipDuplicates: true,
  })

  // Create a notification for 
  // each affected student
  await prisma.notification.createMany({
    data: missingStudentIds.map(
      (studentId) => ({
        userId: studentId,
        title: "Attendance Penalty Issued",
        message: `You missed the mandatory event "${event.title}". Please resolve your penalty before the deadline.`,
        type: "PENALTY",
      })
    ),
  })

  return { 
    generated: result.count, 
    skipped: false,
    studentIds: missingStudentIds,
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
