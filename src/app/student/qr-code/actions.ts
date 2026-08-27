"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { generateQRValue } from "@/lib/utils"

export async function getStudentQRCode() {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  let user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { department: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Fallback generation if a student somehow exists without a QR code string
  if (!user.qrCode) {
    const newQrCode = generateQRValue()
    user = await prisma.user.update({
      where: { id: user.id },
      data: { qrCode: newQrCode },
      include: { department: true }
    })
  }

  return {
    fullName: user.fullName,
    email: user.email,
    qrCode: user.qrCode!,
    studentId: user.studentId,
    yearLevel: user.yearLevel,
    departmentCode: user.department?.code || "N/A",
    departmentName: user.department?.name || "No Department",
    departmentColor: user.department?.color || "#3B82F6",
    id: user.id
  }
}

export async function getStudentActiveEvents() {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, departmentId: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const { getManilaCalendarToday } = await import("@/lib/time")
  const todayStart = getManilaCalendarToday()
  
  const todayEnd = new Date(todayStart)
  todayEnd.setUTCHours(23, 59, 59, 999)

  const events = await prisma.event.findMany({
    where: {
      OR: [
        { status: "ONGOING" },
        { 
          status: "UPCOMING", 
          date: { gte: todayStart, lte: todayEnd }
        }
      ],
      AND: [
        {
          OR: [
            { eventType: "SCHOOL_WIDE" },
            { departmentId: user.departmentId }
          ]
        }
      ]
    },
    orderBy: { date: "asc" },
    select: {
      id: true,
      title: true,
      date: true,
      startTime: true,
      endTime: true,
      venue: true,
      status: true,
      attendanceLogs: {
        where: { userId: user.id },
        select: { checkOut: true, status: true, checkIn: true }
      }
    }
  })

  return events
}
