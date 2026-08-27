"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { EventFormValues } from "@/lib/validations/event"
import { revalidatePath } from "next/cache"
import { EventStatus, EventType, Prisma } from "@prisma/client"
import { generatePenaltiesForEvent } from "@/lib/penalty"
import { syncEventStatuses } from "@/lib/event-sync"
import { createNotificationsForMany } from "@/lib/notifications"

export async function getEvents(page = 1, pageSize = 10, search = "", status?: EventStatus, eventType?: EventType, isArchived = false) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  // Auto-sync events before fetching to ensure real-time statuses
  await syncEventStatuses()

  const whereClause: any = {
    title: { contains: search, mode: "insensitive" },
    isArchived,
  }
  if (status && status !== "ALL" as any) {
    whereClause.status = status
  }
  if (eventType && eventType !== "ALL" as any) {
    whereClause.eventType = eventType
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: [
      { date: "desc" },
      { endTime: "desc" }
    ],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      department: { select: { code: true, name: true, color: true } },
      _count: { select: { attendanceLogs: true } },
    },
  })

  const total = await prisma.event.count({ where: whereClause })

  return { events, total, pages: Math.ceil(total / pageSize) }
}

export async function createEvent(data: EventFormValues) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue,
      eventType: data.eventType,
      expectedAttendees: data.expectedAttendees,
      departmentId: data.departmentId,
      createdById: session.userId,
      isMandatory: data.isMandatory,
      hasCertificate: data.hasCertificate,
      status: "UPCOMING",
    },
  })

  await logActivity(session.userId, session.fullName, "Created Event", `Event: ${event.title}`)
  
  // Notify Students
  try {
    const studentsCondition: Prisma.UserWhereInput = event.departmentId 
      ? { role: "STUDENT", departmentId: event.departmentId } 
      : { role: "STUDENT" };
    const students = await prisma.user.findMany({ where: studentsCondition, select: { id: true } })
    if (students.length > 0) {
      await createNotificationsForMany(
        students.map(s => s.id),
        {
          title: "New Upcoming Event 🎉",
          message: `${event.title} has been scheduled for ${event.date.toLocaleDateString()}. Don't miss it!`,
          type: "EVENT_CREATED"
        }
      )
    }
  } catch (e) {
    console.error("Failed to notify students:", e)
  }

  revalidatePath("/admin/events")
  revalidatePath("/admin/dashboard")
  return event
}

export async function updateEvent(id: string, data: EventFormValues) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      venue: data.venue,
      eventType: data.eventType,
      expectedAttendees: data.expectedAttendees,
      departmentId: data.departmentId,
      isMandatory: data.isMandatory,
      hasCertificate: data.hasCertificate,
    },
  })

  await logActivity(session.userId, session.fullName, "Updated Event", `Event: ${event.title}`)
  revalidatePath("/admin/events")
  revalidatePath("/admin/dashboard")
  return event
}

export async function updateEventStatus(id: string, status: EventStatus) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id },
    select: { status: true },
  })

  if (!existingEvent) throw new Error("Event not found")

  const event = await prisma.event.update({
    where: { id },
    data: { status },
  })

  // Trigger penalties if transitioning to COMPLETED
  if (status === "COMPLETED" && existingEvent.status !== "COMPLETED") {
    try {
      await generatePenaltiesForEvent(id)
    } catch (e) {
      console.error("Failed to process penalties:", e)
    }

    // Notify Admins and Dept Admins of Successful Event
    try {
      const admins = await prisma.user.findMany({
        where: {
          OR: [
            { role: "SUPER_ADMIN" },
            ...(event.departmentId 
              ? [{ role: "DEPT_ADMIN", departmentId: event.departmentId } as Prisma.UserWhereInput] 
              : [])
          ]
        },
        select: { id: true }
      })
      if (admins.length > 0) {
        await createNotificationsForMany(
          admins.map(a => a.id),
          {
            title: "Event Completed Successfully 🎊",
            message: `The event "${event.title}" has successfully concluded.`,
            type: "SYSTEM"
          }
        )
      }
    } catch (e) {
      console.error("Failed to notify admins of completion:", e)
    }
  }

  await logActivity(session.userId, session.fullName, "Updated Event Status", `Event: ${event.title} -> ${status}`)
  revalidatePath("/admin/events")
  revalidatePath("/admin/dashboard")
  return event
}

export async function deleteEvent(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const eventRecord = await prisma.event.findUnique({ where: { id } })
  if (!eventRecord) throw new Error("Event not found")

  if (!eventRecord.isArchived) {
    // Check if there are any attendance logs
    const logCount = await prisma.attendanceLog.count({ where: { eventId: id } })
    if (logCount > 0) {
      throw new Error("Cannot delete active event with existing attendance records")
    }

    // Check if there are any penalties
    const penaltyCount = await prisma.penalty.count({ where: { eventId: id } })
    if (penaltyCount > 0) {
      throw new Error("Cannot delete active event with existing penalties")
    }
  }

  // If archived, or if it has no attendance/penalties, we delete the dependencies
  await prisma.attendanceLog.deleteMany({ where: { eventId: id } })
  await prisma.penalty.deleteMany({ where: { eventId: id } })

  // Unlink any related event proposals so they aren't orphaned or cause deletion failure
  await prisma.eventProposal.updateMany({
    where: { eventId: id },
    data: { eventId: null }
  })

  const event = await prisma.event.delete({ where: { id } })

  await logActivity(session.userId, session.fullName, "Deleted Event", `Event: ${event.title}`)
  revalidatePath("/admin/events")
  revalidatePath("/admin/dashboard")
  return event
}

export async function toggleArchiveEvent(id: string, isArchived: boolean) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const event = await prisma.event.update({
    where: { id },
    data: { isArchived }
  })

  await logActivity(
    session.userId, 
    session.fullName, 
    isArchived ? "Archived Event" : "Restored Event", 
    `Event: ${event.title}`
  )
  
  revalidatePath("/admin/events")
  revalidatePath("/admin/dashboard")
  return event
}

export async function getDepartments() {
  return await prisma.department.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' }
  })
}
