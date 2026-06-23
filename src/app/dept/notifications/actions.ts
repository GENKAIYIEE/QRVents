"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markNotificationAsRead(id: string) {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await prisma.notification.updateMany({
    where: { id, userId: session.userId },
    data: { isRead: true }
  })
  
  revalidatePath("/dept/notifications")
  revalidatePath("/dept/layout") // ensure badge updates
}

export async function markAllNotificationsAsRead() {
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true }
  })

  revalidatePath("/dept/notifications")
  revalidatePath("/dept/layout") // ensure badge updates
}
