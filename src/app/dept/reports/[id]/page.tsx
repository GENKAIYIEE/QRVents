import { Metadata } from "next"
import { getEventDetails } from "./actions"
import { EventReportClient } from "./event-report-client"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Event Report | QRVents Dept Admin",
}

export default async function EventReportPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    const event = await getEventDetails(resolvedParams.id)
    const serializedEvent = {
      ...event,
      date: event.date.toISOString()
    }
    return (
      <div className="max-w-6xl mx-auto">
        <EventReportClient event={serializedEvent as any} />
      </div>
    )
  } catch (e) {
    redirect("/dept/reports")
  }
}
