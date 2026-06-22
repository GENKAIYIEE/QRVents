import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (
      session.role !== "SUPER_ADMIN" && 
      session.role !== "DEPT_ADMIN"
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const penalty = await prisma.penalty.findUnique({
      where: { id: resolvedParams.id },
      include: { event: true },
    })

    if (!penalty) {
      return NextResponse.json(
        { error: "Penalty not found" },
        { status: 404 }
      )
    }

    if (
      session.role === "DEPT_ADMIN" &&
      penalty.event.departmentId !== session.departmentId
    ) {
      return NextResponse.json(
        { error: "You can only manage penalties from your own department" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body 
    // action: "resolve" | "waive"

    if (!["resolve", "waive"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      )
    }

    const updated = await prisma.penalty.update({
      where: { id: resolvedParams.id },
      data: {
        status: action === "resolve" ? "RESOLVED" : "WAIVED",
        resolvedById: session.userId,
        resolvedAt: new Date(),
      },
    })

    await prisma.notification.create({
      data: {
        userId: penalty.studentId,
        title: action === "resolve" ? "Penalty Resolved" : "Penalty Waived",
        message: action === "resolve"
          ? `Your penalty for "${penalty.event.title}" has been marked as resolved.`
          : `Your penalty for "${penalty.event.title}" has been waived.`,
        type: "PENALTY",
      },
    })

    return NextResponse.json({ 
      success: true, 
      penalty: updated 
    })

  } catch (error) {
    console.error("Resolve penalty error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
