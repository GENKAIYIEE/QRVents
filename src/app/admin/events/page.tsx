import { Suspense } from "react"
import { getDepartments } from "./actions"
import { EventsClient } from "./events-client"

export default async function EventsPage() {
  const departments = await getDepartments()
  return (
    <Suspense fallback={null}>
      <EventsClient departments={departments} />
    </Suspense>
  )
}
