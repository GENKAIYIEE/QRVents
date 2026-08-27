import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    
    if (!eventId) {
      return new NextResponse("eventId is required", { status: 400 })
    }

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "ALL"
    let departmentId = searchParams.get("departmentId") || "ALL"
    const yearLevel = searchParams.get("yearLevel") || "ALL"
    const section = searchParams.get("section") || "ALL"

    if (session.role === "DEPT_ADMIN" && session.departmentId) {
      departmentId = session.departmentId
    }

    const whereClause: any = {
      eventId,
      user: {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } }
        ]
      }
    }

    if (status !== "ALL") {
      whereClause.status = status as AttendanceStatus
    }

    if (departmentId !== "ALL") {
      whereClause.user.departmentId = departmentId
    }

    if (yearLevel !== "ALL") {
      whereClause.user.yearLevel = yearLevel
    }

    if (section !== "ALL") {
      whereClause.user.section = { equals: section, mode: "insensitive" }
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    
    if (!event) {
      return new NextResponse("Event not found", { status: 404 })
    }

    const logs = await prisma.attendanceLog.findMany({
      where: whereClause,
      orderBy: { checkIn: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            studentId: true,
            yearLevel: true,
            section: true,
            department: { select: { code: true } }
          }
        }
      }
    })

    return NextResponse.json({ event, logs })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
