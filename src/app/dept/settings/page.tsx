import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"
import { getSystemSettings } from "@/app/admin/settings/actions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings — QRVents Dept Admin",
}

export default async function DeptSettingsPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const [user, systemSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, fullName: true, email: true, role: true },
    }),
    getSystemSettings(),
  ])

  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-10 p-6 lg:p-8">
      <SettingsForm 
        user={user} 
        systemSettings={systemSettings}
      />
    </div>
  )
}
