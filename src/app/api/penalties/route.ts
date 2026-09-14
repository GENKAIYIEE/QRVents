import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { escalateOverduePenalties } from "@/lib/penalty"

export async function GET(
  request: NextRequest
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Refresh overdue statuses 
    // every time the list is loaded
    await escalateOverduePenalties()

    let where: any = {}

    if (session.role === "STUDENT") {
      where = { studentId: session.userId }
    } else if (session.role === "DEPT_ADMIN") {
      where = {
        student: { departmentId: session.departmentId }
      }
    } else if (session.role === "SUPER_ADMIN") {
      // Super Admin sees all penalties across all departments and event types
    } else {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter
    }

    const penalties = await prisma.penalty.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            yearLevel: true,
            department: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            eventType: true,
            department: true,
          },
        },
        resolvedBy: {
          select: { fullName: true },
        },
      },
      orderBy: [
        { status: "asc" },
        { deadline: "asc" },
      ],
    })

    return NextResponse.json({ penalties })

  } catch (error) {
    console.error("Fetch penalties error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
