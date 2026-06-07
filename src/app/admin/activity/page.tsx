"use client"
import { Suspense } from "react"
import { ActivityClient } from "./activity-client"

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span></div>}>
      <ActivityClient />
    </Suspense>
  )
}
