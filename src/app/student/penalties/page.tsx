import { getDashboardData } from "@/lib/student/dashboard-data"
import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"
import { PenaltiesClient } from "./penalties-client"

export default async function StudentPenaltiesPage() {
  const data = await getDashboardData()

  return (
    <StudentLayoutWrapper 
      session={data.session} 
      department={data.department}
      studentUser={data.studentUser}
    >
      <PenaltiesClient />
    </StudentLayoutWrapper>
  )
}
