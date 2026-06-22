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

    if (!session || session.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const penalty = await prisma.penalty.findUnique({
      where: { id: resolvedParams.id },
    })

    if (!penalty || penalty.studentId !== session.userId) {
      return NextResponse.json(
        { error: "Penalty not found" },
        { status: 404 }
      )
    }

    if (penalty.status === "RESOLVED" || penalty.status === "WAIVED") {
      return NextResponse.json(
        { error: "This penalty has already been resolved" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type } = body 
    // type: "FEE" | "COMMUNITY_SERVICE"

    if (!["FEE", "COMMUNITY_SERVICE"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid penalty type" },
        { status: 400 }
      )
    }

    const updated = await prisma.penalty.update({
      where: { id: resolvedParams.id },
      data: { type },
    })

    return NextResponse.json({ 
      success: true, 
      penalty: updated 
    })

  } catch (error) {
    console.error("Choose penalty type error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
