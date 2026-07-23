import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Bell } from "lucide-react"
import { NotificationsClient } from "./notifications-client"

export default async function DeptNotificationsPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="p-6 lg:p-8 w-full max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-[#0F172A]">Notifications</h1>
      </div>
      <p className="text-sm text-[#64748B] mb-8">
        Stay updated with your department's latest alerts and event approvals.
      </p>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  )
}
