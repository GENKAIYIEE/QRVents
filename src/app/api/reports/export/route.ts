import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Auth check
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 })
    }

    // Verify event exists and is accessible
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { department: true }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Fetch logs
    const logs = await prisma.attendanceLog.findMany({
      where: { eventId },
      orderBy: { checkIn: "asc" },
      include: {
        user: {
          select: { fullName: true, email: true, studentId: true, yearLevel: true, section: true, department: { select: { code: true } } }
        }
      }
    })

    // Generate CSV Content
    const headers = ["Name", "Email", "Student ID", "Year Level", "Section", "Department", "Status", "Check-In Date", "Check-In Time", "Check-Out Date", "Check-Out Time"]
    const rows = logs.map(log => [
      `"${log.user.fullName}"`,
      `"${log.user.email}"`,
      `"${log.user.studentId || 'N/A'}"`,
      `"${log.user.yearLevel || 'N/A'}"`,
      `"${log.user.section || 'N/A'}"`,
      `"${log.user.department?.code || 'N/A'}"`,
      `"${log.status}"`,
      `"${format(new Date(log.checkIn), "MMM dd, yyyy")}"`,
      `"${format(new Date(log.checkIn), "hh:mm:ss a")}"`,
      `"${log.checkOut ? format(new Date(log.checkOut), "MMM dd, yyyy") : 'N/A'}"`,
      `"${log.checkOut ? format(new Date(log.checkOut), "hh:mm:ss a") : 'N/A'}"`
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")

    // Return as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${format(new Date(), "yyyyMMdd")}.csv"`,
      }
    })

  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Server error during export" }, { status: 500 })
  }
}
