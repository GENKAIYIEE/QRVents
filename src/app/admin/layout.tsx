import { getSession } from "@/lib/auth"
import { AdminLayoutClient } from "@/components/layout/admin-layout-client"
import prisma from "@/lib/prisma"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  
  const pendingProposalsCount = await prisma.eventProposal.count({ 
    where: { status: "PENDING" } 
  })

  return (
    <AdminLayoutClient session={session} pendingProposalsCount={pendingProposalsCount}>
      {children}
    </AdminLayoutClient>
  )
}
