import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"
<<<<<<< HEAD
import { getSystemSettings } from "@/app/admin/settings/actions"
=======
>>>>>>> 12d6df37613385feb666361847edcccdfb68a19c
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Settings — QRVents Dept Admin",
=======
  title: "Settings — QRVents Department",
>>>>>>> 12d6df37613385feb666361847edcccdfb68a19c
}

export default async function DeptSettingsPage() {
  const session = await getSession()
<<<<<<< HEAD
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const [user, systemSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, fullName: true, email: true, role: true },
    }),
    getSystemSettings(),
  ])
=======
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, role: true },
  })
>>>>>>> 12d6df37613385feb666361847edcccdfb68a19c

  if (!user) redirect("/login")

  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-6 w-full max-w-full pb-10 p-6 lg:p-8">
      <SettingsForm 
        user={user} 
        systemSettings={systemSettings}
=======
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      <SettingsForm 
        user={user} 
>>>>>>> 12d6df37613385feb666361847edcccdfb68a19c
      />
    </div>
  )
}
