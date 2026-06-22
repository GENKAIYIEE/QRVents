import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    
    // Both Admin and Dept Admin can view logs
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const log = await prisma.attendanceLog.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, studentId: true, departmentId: true } },
        event: { select: { title: true } },
      }
    })

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error("Failed to fetch log detail:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
