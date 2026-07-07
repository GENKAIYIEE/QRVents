import { SettingsForm } from "@/components/admin/settings-form"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings — QRVents Department",
}

export default async function DeptSettingsPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      <SettingsForm 
        user={user} 
      />
    </div>
  )
}
