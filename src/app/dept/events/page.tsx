import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { format } from "date-fns"
import { EventsClient } from "./events-client"

export const metadata: Metadata = {
  title: "Events — QRVents Dept Admin",
}

export default async function DeptEventsPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  // Auto-sync real-time statuses
  const { syncEventStatuses } = await import("@/lib/event-sync")
  await syncEventStatuses()

  // Fetch approved events (upcoming/ongoing) that the dept admin can manage/see
  const events = await prisma.event.findMany({
    where: { 
      departmentId: user?.departmentId
    },
    orderBy: [
      { date: "desc" },
      { endTime: "desc" }
    ],
    include: {
      _count: {
        select: { attendanceLogs: true }
      }
    }
  })

  const upcomingEvents = events.filter(e => e.status === "UPCOMING" || e.status === "ONGOING")
  const pastEvents = events.filter(e => e.status === "COMPLETED" || e.status === "CANCELLED")

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Events Management</h1>
        <p className="text-slate-500 mt-1">Manage and view details for all upcoming and ongoing events.</p>
      </div>

      <section>
        <EventsClient upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      </section>
    </div>
  )
}
