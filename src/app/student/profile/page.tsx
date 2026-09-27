import { getDashboardData } from "@/lib/student/dashboard-data"
import { ProfileClient } from "./profile-client"
import { prisma } from "@/lib/prisma"

export default async function StudentProfilePage() {
  const data = await getDashboardData({ skipSectionCheck: true })

  // Fetch department with sections for the forced update flow
  const department = data.studentUser?.departmentId
    ? await prisma.department.findUnique({
        where: { id: data.studentUser.departmentId },
        select: { name: true, code: true, sections: true },
      })
    : null

  // Ensure department is populated on studentUser
  const enhancedUser = {
    ...data.studentUser,
    id: data.studentUser?.id || "",
    fullName: data.studentUser?.fullName || "",
    email: data.studentUser?.email || "",
    role: data.studentUser?.role || "STUDENT",
    section: data.studentUser?.section || null,
    department: department || data.department,
  }

  return (
    <ProfileClient user={enhancedUser} />
  )
}
