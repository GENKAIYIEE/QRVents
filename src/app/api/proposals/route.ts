import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { createNotificationsForMany } from "@/lib/notifications"

const proposalSchema = z.object({
  title: z.string().min(3, "Title is too short").max(100, "Title is too long"),
  description: z.string().optional(),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:MM
  endTime: z.string(), // HH:MM
  venue: z.string().min(2, "Venue is required"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Only DEPT_ADMIN can propose events
    if (!session || session.role !== "DEPT_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const result = proposalSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = result.data

    // Fetch user to get their departmentId
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { departmentId: true, department: true },
    })

    if (!user || !user.departmentId) {
      return NextResponse.json({ error: "User is not assigned to a department" }, { status: 403 })
    }

    // Create the proposal
    const proposal = await prisma.eventProposal.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        venue: data.venue,
        status: "PENDING",
        submittedById: session.userId,
        departmentId: user.departmentId,
      },
    })

    // Notify Super Admins
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    })
    
    if (superAdmins.length > 0) {
      await createNotificationsForMany(
        superAdmins.map(a => a.id),
        {
          title: "New Event Proposal 📋",
          message: `${session.fullName} submitted a new proposal: ${proposal.title}`,
          type: "PROPOSAL_SUBMITTED",
        }
      )
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.userId,
        userName: session.fullName,
        action: `Submitted event proposal: ${proposal.title}`,
      }
    })

    return NextResponse.json({ success: true, proposal })
  } catch (error) {
    console.error("Failed to create proposal:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
