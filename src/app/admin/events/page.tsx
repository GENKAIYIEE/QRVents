import { getDepartments } from "./actions"
import { EventsClient } from "./events-client"

export default async function EventsPage() {
  const departments = await getDepartments()
  return <EventsClient departments={departments} />
}

