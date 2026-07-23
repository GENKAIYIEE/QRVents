import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    if (event.status !== "ONGOING") {
      return NextResponse.json({ error: "Event is not currently ongoing" }, { status: 400 })
    }

    // Find the user by QR code
    const user = await prisma.user.findUnique({
      where: { qrCode },
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

      // Perform Check-Out
      await prisma.attendanceLog.update({
        where: { id: existingLog.id },
        data: {
          checkOut: new Date(),
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
    try {
      await prisma.attendanceLog.create({
        data: {
          userId: user.id,
          eventId: event.id,
          status: isGuest ? "GUEST" : "PRESENT",
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

    return NextResponse.json({
      success: true,
      action: "check-in",
      user: { fullName: user.fullName, isGuest },
      message: "Checked in successfully"
    })
  } catch (error) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: "Server error during scan" }, { status: 500 })
  }
}
