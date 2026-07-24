"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { ProposalStatus } from "@prisma/client"

export async function getProposals(page = 1, pageSize = 10, status?: ProposalStatus | "ALL") {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  if (!user || !user.departmentId) {
    throw new Error("User not assigned to a department")
  }

  const whereClause: any = { departmentId: user.departmentId }
  
  if (status && status !== "ALL") {
    whereClause.status = status
  }

  const [proposals, total] = await Promise.all([
    prisma.eventProposal.findMany({
      where: whereClause,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        status: true,
        rejectionReason: true,
        submittedAt: true,
      }
    }),
    prisma.eventProposal.count({ where: whereClause })
  ])

  return { proposals, total, pages: Math.ceil(total / pageSize) }
}
