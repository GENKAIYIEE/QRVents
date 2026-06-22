import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ProposeEventClient } from "./propose-client"

export const metadata: Metadata = {
  title: "Propose Event — QRVents Dept Admin",
}

export default async function ProposeEventPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  if (!user || !user.departmentId) {
    return (
      <div className="p-8 text-center text-slate-500">
        You are not assigned to a department. Please contact a Super Admin.
      </div>
    )
  }

  // Fetch past proposals for this department
  const pastProposals = await prisma.eventProposal.findMany({
    where: { departmentId: user.departmentId },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      title: true,
      date: true,
      venue: true,
      status: true,
      rejectionReason: true,
      submittedAt: true,
    }
  })

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Event Proposals</h1>
        <p className="text-slate-500 mt-1">Submit new events for approval and track your pending requests.</p>
      </div>

      <ProposeEventClient initialProposals={pastProposals} />
    </div>
  )
}
