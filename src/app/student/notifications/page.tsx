import { getDashboardData } from "@/lib/student/dashboard-data"
import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"
import { NotificationsClient } from "./notifications-client"

export default async function StudentNotificationsPage() {
  const data = await getDashboardData()

  return (
    <StudentLayoutWrapper 
      session={data.session} 
      department={data.department}
      studentUser={data.studentUser}
    >
      <NotificationsClient />
    </StudentLayoutWrapper>
  )
}
