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
  }
}
