"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { EventFormValues } from "@/lib/validations/event"
import { revalidatePath } from "next/cache"
import { EventStatus, EventType } from "@prisma/client"
import { generatePenaltiesForEvent } from "@/lib/penalty"
import { syncEventStatuses } from "@/lib/event-sync"

export async function getEvents(page = 1, pageSize = 10, search = "", status?: EventStatus, eventType?: EventType) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  // Auto-sync events before fetching to ensure real-time statuses
  await syncEventStatuses()

  const whereClause: any = {
    title: { contains: search, mode: "insensitive" },
  }
  if (status && status !== "ALL" as any) {
    whereClause.status = status
  }
  if (eventType && eventType !== "ALL" as any) {
    whereClause.eventType = eventType
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
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
      status: "UPCOMING",
    },
  })

  await logActivity(session.userId, session.fullName, "Created Event", `Event: ${event.title}`)
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

  // Check if there are any attendance logs
  const logCount = await prisma.attendanceLog.count({ where: { eventId: id } })
  if (logCount > 0) {
    throw new Error("Cannot delete event with existing attendance records")
  }

  // Check if there are any penalties
  const penaltyCount = await prisma.penalty.count({ where: { eventId: id } })
  if (penaltyCount > 0) {
    throw new Error("Cannot delete event with existing penalties")
  }

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

export async function getDepartments() {
  return await prisma.department.findMany({
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' }
  })
}
