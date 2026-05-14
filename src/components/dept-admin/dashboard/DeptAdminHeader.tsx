"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

export function DeptAdminHeader({ session, department }: { session: any; department: any }) {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b border-slate-200 px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:ml-0 ml-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, <span className="font-medium text-slate-700">{session.fullName}</span>! Here's what's happening in {department.name}.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-sm font-medium text-slate-600 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          {time ? format(time, "EEEE, MMMM d, yyyy · h:mm:ss a") : "Loading..."}
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: department.lightBg,
            color: department.color,
            borderColor: `${department.color}30`,
          }}
        >
          {department.code}
        </div>
      </div>
    </header>
  )
}
