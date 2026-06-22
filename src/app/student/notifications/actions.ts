"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getStudentNotifications() {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return { notifications, unreadCount }
}

export async function markAsRead(notificationId: string) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  await prisma.notification.update({
    where: { 
      id: notificationId,
      userId: session.userId 
    },
    data: { isRead: true }
  })

  // Revalidate to update server components if needed
  revalidatePath("/student/dashboard")
  return { success: true }
}

export async function markAllAsRead() {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    throw new Error("Unauthorized")
  }

  await prisma.notification.updateMany({
    where: { 
      userId: session.userId,
      isRead: false
    },
    data: { isRead: true }
  })

  revalidatePath("/student/dashboard")
  return { success: true }
}
