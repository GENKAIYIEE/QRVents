import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { format } from "date-fns"

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    
    if (!eventId) {
      return new NextResponse("eventId is required", { status: 400 })
    }

    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "ALL"
    const departmentId = searchParams.get("departmentId") || "ALL"
    const yearLevel = searchParams.get("yearLevel") || "ALL"
    const section = searchParams.get("section") || "ALL"

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
    const title = event?.title.replace(/\s+/g, "-").toLowerCase() || "event"
    const filename = `attendance-${title}-${format(new Date(), "yyyy-MM-dd")}.csv`

    const BATCH_SIZE = 1000

    const stream = new ReadableStream({
      async start(controller) {
        // Send BOM and headers
        const headers = "Name,Student ID,Year Level,Section,Department,Check-In Date,Check-In Time,Check-Out Date,Check-Out Time,Status\n"
        controller.enqueue(new TextEncoder().encode("\uFEFF" + headers))

        let skip = 0
        let keepFetching = true

        while (keepFetching) {
          const logs = await prisma.attendanceLog.findMany({
            where: whereClause,
            orderBy: { checkIn: "desc" },
            skip,
            take: BATCH_SIZE,
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

          if (logs.length === 0) {
            keepFetching = false
            break
          }

          let chunk = ""
          for (const log of logs) {
            const checkInDate = format(new Date(log.checkIn), "MMM dd, yyyy")
            const checkInTime = format(new Date(log.checkIn), "hh:mm:ss a")
            const checkOutDate = log.checkOut ? format(new Date(log.checkOut), "MMM dd, yyyy") : "-"
            const checkOutTime = log.checkOut ? format(new Date(log.checkOut), "hh:mm:ss a") : "-"
            
            const row = [
              log.user.fullName,
              log.user.studentId || "-",
              log.user.yearLevel || "-",
              log.user.section || "-",
              log.user.department?.code || "Unknown",
              checkInDate,
              checkInTime,
              checkOutDate,
              checkOutTime,
              log.status
            ]
            chunk += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",") + "\n"
          }

          controller.enqueue(new TextEncoder().encode(chunk))
          skip += BATCH_SIZE

          if (logs.length < BATCH_SIZE) {
            keepFetching = false
          }
        }
        controller.close()
      }
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      }
    })
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 })
  }
}
