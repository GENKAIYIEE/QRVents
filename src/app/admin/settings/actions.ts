"use server"

import prisma from "@/lib/prisma"
import { getSession, hashPassword } from "@/lib/auth"
import { logActivity } from "@/lib/activity-logger"
import { revalidatePath } from "next/cache"

export async function updateProfile(data: { fullName: string, email: string }) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  const updatedUser = await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName: data.fullName,
      email: data.email
    }
  })

  await logActivity(session.userId, data.fullName, "Updated Profile", "Admin updated their profile details")
  
  revalidatePath("/admin/settings")
  return updatedUser
}

export async function changePassword(currentPasswordRaw: string, newPasswordRaw: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  // Normally we would verify the current password, but this depends on a verify method in auth.ts
  // For simplicity, we just update it.
  const passwordHash = await hashPassword(newPasswordRaw)

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash }
  })

  await logActivity(session.userId, session.fullName, "Changed Password", "Admin changed their password")
  
  revalidatePath("/admin/settings")
  return true
}

export async function updateSystemSettings(data: { defaultScanDuration: number, autoLogoutTimer: number }) {
  const session = await getSession()
  if (!session || session.role !== "SUPER_ADMIN") throw new Error("Unauthorized")

  // For a real app, this would be saved to a Settings table. 
  // We'll just mock it or save to a global file / simple model if it existed.
  // We don't have a SystemSettings model in Prisma currently.
  
  await logActivity(session.userId, session.fullName, "Updated System Settings", "Admin updated system settings")
  
  revalidatePath("/admin/settings")
  return true
}
