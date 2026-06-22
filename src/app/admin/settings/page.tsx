import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"
import { getSystemSettings } from "@/app/admin/settings/actions"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings — QRVents Admin",
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const [user, systemSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, fullName: true, email: true, role: true },
    }),
    getSystemSettings(),
  ])

  if (!user) redirect("/login")

  return (
    <SettingsForm
      user={user}
      systemSettings={systemSettings}
    />
  )
}
