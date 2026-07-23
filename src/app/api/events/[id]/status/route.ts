import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { 
  generatePenaltiesForEvent,
  getMissingAttendees 
} from "@/lib/penalty"

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

    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Role-based access: 
    // Super Admin can update any event.
    // Dept Admin can only update 
    // events from their own department.
    if (
      session.role === "DEPT_ADMIN" &&
      event.departmentId !== session.departmentId
    ) {
      return NextResponse.json(
        { error: "You can only update events from your own department" },
        { status: 403 }
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

    const body = await request.json()
    const { status } = body

    const validStatuses = [
      "UPCOMING", 
      "ONGOING", 
      "COMPLETED", 
      "CANCELLED"
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      )
    }

    const updatedEvent = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      event: updatedEvent,
    })

  } catch (error) {
    console.error("Event status update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// ─────────────────────────────
// GET endpoint — used by the 
// confirmation modal to preview 
// how many students will be 
// penalized BEFORE confirming
// ─────────────────────────────

export async function GET(
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

    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (!event.isMandatory) {
      return NextResponse.json({
        isMandatory: false,
        missingCount: 0,
      })
    }

    const missingStudentIds = await getMissingAttendees(resolvedParams.id)

    return NextResponse.json({
      isMandatory: true,
      missingCount: missingStudentIds.length,
    })

  } catch (error) {
    console.error("Preview missing attendees error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
