"use server"

import prisma from "@/lib/prisma"
import { getSession, hashPassword, comparePassword } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { fullName: string, email: string }) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  // Check email uniqueness if changed
  if (data.email !== session.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing && existing.id !== session.userId) {
      throw new Error("Email already in use by another account.")
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName: data.fullName,
      email: data.email,
    },
  })

  await logActivity(session.userId, data.fullName, "Updated Profile", "User updated their profile details")

  revalidatePath("/admin/settings")
  revalidatePath("/dept/settings")
  return updatedUser
}

export async function changePassword(currentPasswordRaw: string, newPasswordRaw: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  if (newPasswordRaw.length < 6) {
    throw new Error("New password must be at least 6 characters.")
  }

  // Fetch user to verify current password
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) throw new Error("User not found.")

  const isValid = await comparePassword(currentPasswordRaw, user.passwordHash)
  if (!isValid) {
    throw new Error("Current password is incorrect.")
  }

  const passwordHash = await hashPassword(newPasswordRaw)

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash },
  })

  await logActivity(session.userId, session.fullName, "Changed Password", "User changed their account password")

  revalidatePath("/admin/settings")
  revalidatePath("/dept/settings")
  return true
}

export async function updateSystemSettings(data: { defaultScanDuration: number, autoLogoutTimer: number }) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized")

  await prisma.systemSettings.upsert({
    where: { id: "global" },
    update: {
      defaultScanDuration: data.defaultScanDuration,
      autoLogoutTimer: data.autoLogoutTimer,
    },
    create: {
      id: "global",
      defaultScanDuration: data.defaultScanDuration,
      autoLogoutTimer: data.autoLogoutTimer,
    },
  })

  await logActivity(session.userId, session.fullName, "Updated System Settings", "Admin updated system configuration")

  revalidatePath("/admin/settings")
  return true
}

export async function getSystemSettings() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } })
  return settings ?? { id: "global", defaultScanDuration: 120, autoLogoutTimer: 5 }
}
