"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateStudentProfile(data: {
  fullName: string
  email: string
  yearLevel?: string | null
}) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  // Basic validation
  if (!data.fullName.trim() || !data.email.trim()) {
    throw new Error("Full Name and Email are required.")
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName: data.fullName,
      email: data.email,
      yearLevel: data.yearLevel,
    },
  })

  revalidatePath("/student/profile")
  revalidatePath("/student/dashboard")
  
  return { success: true }
}

export async function changePassword(newPasswordRaw: string) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  // NOTE: For better security in production, you should import `hashPassword` from "@/lib/auth"
  // Since we don't have it explicitly imported here, we'll do a basic update using Prisma.
  // Actually, let's just import hashPassword dynamically or add it to imports.
  const { hashPassword } = await import("@/lib/auth")
  const passwordHash = await hashPassword(newPasswordRaw)

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash }
  })

  return { success: true }
}
