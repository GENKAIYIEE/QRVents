import { Metadata } from "next"
import { getEventDetails, getDepartments } from "./actions"
import { AdminEventReportClient } from "./admin-event-report-client"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Event Report | QRVents Admin",
}

export default async function AdminEventReportPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const event = await getEventDetails(resolvedParams.id)
    const departments = await getDepartments()
    
    const serializedEvent = {
      ...event,
      date: event.date.toISOString()
    }
    return (
      <div className="max-w-6xl mx-auto">
        <AdminEventReportClient event={serializedEvent as any} departments={departments} />
      </div>
    )
  } catch (e) {
    redirect("/admin/reports")
  }
}
