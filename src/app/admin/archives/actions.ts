"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { revalidatePath } from "next/cache"

export async function restoreArchive(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const proposal = await prisma.eventProposal.findUnique({ where: { id } })
  if (!proposal) throw new Error("Proposal not found")
  if (!proposal.isArchived) throw new Error("Proposal is not archived")

  const updatedProposal = await prisma.eventProposal.update({
    where: { id },
    data: { isArchived: false },
  })

  await logActivity(session.userId, session.fullName, "Restored Archive", `Proposal: ${proposal.title}`)
  
  revalidatePath("/admin/archives")
  revalidatePath("/admin/proposals")
  
  return updatedProposal
}

export async function deleteArchivePermanent(id: string) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }

  const proposal = await prisma.eventProposal.findUnique({ where: { id } })
  if (!proposal) throw new Error("Proposal not found")
  if (!proposal.isArchived) throw new Error("Only archived proposals can be permanently deleted")

  await prisma.eventProposal.delete({
    where: { id },
  })

  await logActivity(session.userId, session.fullName, "Permanently Deleted Archive", `Proposal: ${proposal.title}`)
  
  revalidatePath("/admin/archives")
  
  return { success: true }
}
