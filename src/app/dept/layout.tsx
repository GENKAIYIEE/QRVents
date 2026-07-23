import { getDeptLayoutData } from "@/lib/dept-admin/dashboard-data"
import { DeptLayoutClient } from "@/components/layout/dept-layout-client"

export default async function DeptLayout({ children }: { children: React.ReactNode }) {
  const { session, department, unreadNotifications } = await getDeptLayoutData()

  return (
    <DeptLayoutClient session={session} department={department} unreadNotifications={unreadNotifications}>
      {children}
    </DeptLayoutClient>
  )
}
