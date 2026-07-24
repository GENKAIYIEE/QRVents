import { getStudentLayoutData } from "@/lib/student/layout-data"
import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { session, department, studentUser } = await getStudentLayoutData()

  return (
    <StudentLayoutWrapper session={session} department={department} studentUser={studentUser}>
      {children}
    </StudentLayoutWrapper>
  )
}
