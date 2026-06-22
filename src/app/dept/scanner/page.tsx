import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ScannerClient } from "@/components/scanner/ScannerClient"

export const metadata: Metadata = {
  title: "Scanner — QRVents Dept Admin",
}

export default async function DeptScannerPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { departmentId: true }
  })

  // Fetch only ONGOING events for scanning
  // Dept Admins can scan events in their department OR school-wide events
  const events = await prisma.event.findMany({
    where: { 
      status: "ONGOING",
      OR: [
        { departmentId: user?.departmentId },
        { eventType: "SCHOOL_WIDE" }
      ]
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      date: true,
      venue: true,
    },
  })

  // Fetch global settings for auto-lock timer
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
  })
  
  const autoLockSeconds = settings?.defaultScanDuration ?? 120

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto pb-10">
      <ScannerClient events={events} autoLockSeconds={autoLockSeconds} basePath="Department" />
    </div>
  )
}
