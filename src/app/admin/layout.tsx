import { getSession } from "@/lib/auth"
import { AdminLayoutClient } from "@/components/layout/admin-layout-client"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  )
}
