import { getDashboardData } from "@/lib/student/dashboard-data"
import { ProfileClient } from "./profile-client"

export default async function StudentProfilePage() {
  const data = await getDashboardData()

  // Ensure department is populated on studentUser
  const enhancedUser = {
    ...data.studentUser,
    id: data.studentUser?.id || "",
    fullName: data.studentUser?.fullName || "",
    email: data.studentUser?.email || "",
    role: data.studentUser?.role || "STUDENT",
    department: data.department
  }

  return (
    <ProfileClient user={enhancedUser} />
  )
}
