"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { ProposalStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getProposals(page = 1, pageSize = 10, status: string = "ALL", search?: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const whereClause: any = {}
  if (status !== "ALL") {
    whereClause.status = status as ProposalStatus
  }
  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { venue: { contains: search, mode: "insensitive" } },
      { department: { name: { contains: search, mode: "insensitive" } } },
      { department: { code: { contains: search, mode: "insensitive" } } },
    ]
  }

  const proposals = await prisma.eventProposal.findMany({
    where: whereClause,
    orderBy: { submittedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      department: { select: { code: true, name: true, color: true } },
      submittedBy: { select: { fullName: true, email: true } },
    },
  })

  const total = await prisma.eventProposal.count({ where: whereClause })

  return { proposals, total, pages: Math.ceil(total / pageSize) }
}

export async function getProposalById(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  return await prisma.eventProposal.findUnique({
    where: { id },
    include: {
      department: { select: { code: true, name: true, color: true } },
      submittedBy: { select: { fullName: true, email: true } },
    },
  })
}

export async function reviewProposal(id: string, status: ProposalStatus, rejectionReason?: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const proposal = await prisma.eventProposal.findUnique({ where: { id } })
  if (!proposal) throw new Error("Proposal not found")

  // Update proposal status
  const updatedProposal = await prisma.eventProposal.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === "REJECTED" ? rejectionReason : null,
      reviewedAt: new Date(),
    },
  })

  // Auto-create Event if APPROVED
  if (status === "APPROVED" && !proposal.eventId) {
    const event = await prisma.event.create({
      data: {
        title: proposal.title,
        description: proposal.description,
        date: proposal.date,
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        venue: proposal.venue,
        eventType: "DEPARTMENT",
        departmentId: proposal.departmentId,
        createdById: session.userId,
        status: "UPCOMING",
      },
    })
    
    // Link event to proposal and publish
    await prisma.eventProposal.update({
      where: { id },
      data: { eventId: event.id, isPublished: true },
    })
  }

  await logActivity(session.userId, session.fullName, "Reviewed Proposal", `Proposal: ${proposal.title} -> ${status}`)
  
  revalidatePath("/admin/proposals")
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/events")
  
  return updatedProposal
}
