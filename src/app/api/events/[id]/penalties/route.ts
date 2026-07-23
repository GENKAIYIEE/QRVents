import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generatePenaltiesForEvent } from "@/lib/penalty"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getSession()

    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (session.role === "DEPT_ADMIN" && event.departmentId !== session.departmentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (!event.isMandatory) {
      return NextResponse.json({ error: "Event is not mandatory" }, { status: 400 })
    }

    if (event.penaltiesGenerated) {
      return NextResponse.json({ error: "Penalties already generated" }, { status: 400 })
    }

    const penaltyResult = await generatePenaltiesForEvent(resolvedParams.id)

    await prisma.event.update({
      where: { id: resolvedParams.id },
      data: { penaltiesGenerated: true },
    })

    return NextResponse.json({
      success: true,
      penaltyResult,
    })

  } catch (error) {
    console.error("Penalty generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
