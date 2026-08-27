import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { getManilaCalendarToday } = await import("@/lib/time")
    
    // Get the exact UTC Midnight representing today in Manila
    const todayStart = getManilaCalendarToday()
    
    // The end of the calendar day (for querying events) is exactly 23:59:59.999 of that UTC day
    const todayEnd = new Date(todayStart)
    todayEnd.setUTCHours(23, 59, 59, 999)

    let whereClause: any = {
      OR: [
        { status: "ONGOING" },
        {
          status: "UPCOMING",
          date: { gte: todayStart, lte: todayEnd }
        }
      ]
    }

    // Super Admin only sees SCHOOL_WIDE events
    if (session.role === "SUPER_ADMIN") {
      whereClause.eventType = "SCHOOL_WIDE"
    }
    
    // Dept admins see their department's events + school-wide
    if (session.role === "DEPT_ADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { departmentId: true }
      })
      whereClause.AND = [
        { departmentId: user?.departmentId }
      ]
    }

    const rawEvents = await prisma.event.findMany({
      where: whereClause,
      orderBy: [
        { date: "desc" },
        { endTime: "desc" }
      ],
      select: {
        id: true,
        title: true,
        date: true,
        venue: true,
        startTime: true,
        status: true,
      },
    })

    // Return raw events directly. The client component will calculate the
    // 45-minute window using its own local timezone, bypassing Vercel UTC issues.
    return NextResponse.json({ events: rawEvents })
  } catch (error) {
    console.error("Scanner events fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
