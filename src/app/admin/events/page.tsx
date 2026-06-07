import { Suspense } from "react"
import { getDepartments } from "./actions"
import { EventsClient } from "./events-client"

export default async function EventsPage() {
  const departments = await getDepartments()
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span></div>}>
      <EventsClient departments={departments} />
    </Suspense>
  )
}

