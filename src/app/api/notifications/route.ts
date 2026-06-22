import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifications — fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where = {
      userId: session.userId,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
    ])

    return NextResponse.json({ success: true, data: { notifications, unreadCount } })
  } catch (error) {
    console.error("Notifications GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/notifications — mark as read or mark all as read
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, notificationId } = body

    if (action === "mark_read" && notificationId) {
      // Mark a single notification as read
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: session.userId },
        data: { isRead: true },
      })
    } else if (action === "mark_all_read") {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notifications POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
