import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isCheckInLate, getPenaltySettings } from "@/lib/penalty"
import { addDays } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "DEPT_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { qrCode, eventId } = await request.json()

    if (!qrCode || !eventId) {
      return NextResponse.json({ error: "Missing QR code or Event ID" }, { status: 400 })
    }

    // Find the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const realNow = new Date() // Absolute UTC time for database writes and cooldowns
    // Vercel runs in UTC. We must ensure 'localNow' reflects Philippine time (UTC+8)
    // so it aligns with the hours/minutes stored in the database for schedule checks.
    const manilaTimeStr = realNow.toLocaleString("en-US", { timeZone: "Asia/Manila" })
    const localNow = new Date(manilaTimeStr)

    let isAllowed = false;
    
    if (event.status === "ONGOING") {
      isAllowed = true;
    } else if (event.status === "UPCOMING" && event.startTime) {
      const [startHours, startMinutes] = event.startTime.split(":").map(Number);
      const eventStartDate = new Date(manilaTimeStr); // Start with today's date in Manila
      eventStartDate.setHours(startHours, startMinutes, 0, 0);
      
      const timeDiffMinutes = (eventStartDate.getTime() - localNow.getTime()) / (1000 * 60);
      
      // Allow if starting within 45 minutes (or if start time has passed)
      if (timeDiffMinutes <= 45) {
        isAllowed = true;
      }
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Event is not active yet (opens 45 mins before start)" }, { status: 400 })
    }

    let extractedUserId: string | null = null
    let extractedEventId: string | null = null

    try {
      const decodedQr = Buffer.from(qrCode, 'base64').toString('utf-8')
      if (decodedQr.startsWith("QRV-EVT|")) {
        const parts = decodedQr.split("|")
        extractedUserId = parts[1]
        extractedEventId = parts[2]
      }
    } catch (e) {
      // Not base64 or invalid, proceed to fallback logic
    }

    if (extractedEventId && extractedEventId !== eventId) {
      return NextResponse.json({ error: "QR code belongs to a different event" }, { status: 400 })
    }

    // Find the user by dynamic userId OR fallback to static qrCode
    const user = await prisma.user.findFirst({
      where: extractedUserId 
        ? { id: extractedUserId }
        : { qrCode },
      select: { id: true, fullName: true, role: true, departmentId: true, isActive: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid QR Code" }, { status: 404 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 })
    }

    // Determine if guest
    let isGuest = false
    if (event.eventType === "DEPARTMENT" && event.departmentId !== user.departmentId) {
      isGuest = true
    }

    // Check existing attendance log
    const existingLog = await prisma.attendanceLog.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: event.id,
        },
      },
    })

    if (existingLog) {
      if (existingLog.checkOut) {
        return NextResponse.json({ 
          error: "Attendance already completed (Checked In & Out)",
          user: { fullName: user.fullName }
        }, { status: 400 })
      }

      // 1. Cooldown Guard (Anti-Double Scan) uses absolute UTC time
      const timeInDiffMinutes = (realNow.getTime() - existingLog.createdAt.getTime()) / (1000 * 60)
      if (timeInDiffMinutes < 5) {
        return NextResponse.json({
          error: "Too soon to check out. Scan ignored to prevent accidental double-scans.",
          user: { fullName: user.fullName }
        }, { status: 400 })
      }

      // 2. Strict End-Time Guard uses local wall-clock time
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(":").map(Number)
        const eventEndDate = new Date(manilaTimeStr) // Use today's date in Manila
        eventEndDate.setHours(endHours, endMinutes, 0, 0)

        if (localNow < eventEndDate) {
          const formattedEndTime = eventEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          return NextResponse.json({
            error: `Cannot check out yet. Event ends strictly at ${formattedEndTime}.`,
            user: { fullName: user.fullName }
          }, { status: 400 })
        }
      }

      // Perform Check-Out using absolute UTC time
      await prisma.attendanceLog.update({
        where: { id: existingLog.id },
        data: {
          checkOut: realNow,
          status: "CHECKED_OUT"
        },
      })

      return NextResponse.json({
        success: true,
        action: "check-out",
        user: { fullName: user.fullName, isGuest },
        message: "Checked out successfully"
      })
    }

    // Perform Check-In
    let isLate = false

    try {
      await prisma.attendanceLog.create({
        data: {
          userId: user.id,
          eventId: event.id,
          status: isGuest ? "GUEST" : "PRESENT",
          isLate: false, // will be updated below if late
        },
      })
    } catch (e: any) {
      if (e.code === "P2002") {
        // Concurrency double-fire: log was already created by parallel request
        return NextResponse.json({
          success: true,
          action: "check-in",
          user: { fullName: user.fullName, isGuest },
          message: "Checked in successfully"
        })
      }
      throw e
    }

    // ── Late Detection (only for non-guests on mandatory events) ──
    if (!isGuest && event.isMandatory && event.startTime) {
      isLate = isCheckInLate(localNow, event.startTime, event.date)

      if (isLate) {
        // Mark attendance log as late
        await prisma.attendanceLog.update({
          where: { userId_eventId: { userId: user.id, eventId: event.id } },
          data: { isLate: true },
        })

        // Issue an immediate LATE penalty (skip if already exists)
        try {
          const settings = await getPenaltySettings()
          await prisma.penalty.create({
            data: {
              studentId: user.id,
              eventId: event.id,
              reason: "LATE",
              feeAmount: settings.defaultFee,
              serviceHours: settings.defaultServiceHours,
              deadline: addDays(realNow, settings.defaultDeadlineDays),
              status: "PENDING",
            },
          })

          // Notify the student
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: "Attendance Penalty — Late Check-In",
              message: `You were late to the mandatory event "${event.title}". A penalty has been issued.`,
              type: "PENALTY",
            },
          })
        } catch (penaltyErr: any) {
          // P2002 = penalty already exists; safe to ignore
          if (penaltyErr?.code !== "P2002") {
            console.error("Late penalty creation error:", penaltyErr)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      action: "check-in",
      isLate,
      user: { fullName: user.fullName, isGuest },
      message: isLate
        ? "Checked in — but you are LATE. A penalty has been issued."
        : "Checked in successfully"
    })
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: "Server error during scan" }, { status: 500 })
  }
}
