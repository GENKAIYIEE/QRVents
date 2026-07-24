import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { ProposeEventClient } from "./propose-client"

import { getProposals } from "./actions"

export const metadata: Metadata = {
  title: "Propose Event — QRVents Dept Admin",
}

export default async function ProposeEventPage() {
  const session = await getSession()
  if (!session || session.role !== "DEPT_ADMIN") redirect("/login")

  let initialData = { proposals: [], total: 0, pages: 1 }
  try {
    initialData = await getProposals(1, 10, "ALL") as any
  } catch (error) {
    return (
      <div className="p-8 text-center text-slate-500">
        You are not assigned to a department. Please contact a Super Admin.
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-500 text-[32px]">edit_calendar</span>
          Propose Event
        </h1>
        <p className="text-slate-500 mt-1">Submit a new event proposal to the Super Admin for approval.</p>
      </div>

      <ProposeEventClient initialData={initialData} />
    </div>
  )
}
