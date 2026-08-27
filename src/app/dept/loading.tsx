import React from "react"
import { TableSkeleton, CardSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-3"></div>
          <div className="h-4 w-64 bg-slate-200 rounded-md animate-pulse"></div>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="h-10 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
      
      {/* Cards Skeleton */}
      <CardSkeleton count={3} />
      
      {/* Table Skeleton */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        <TableSkeleton rows={6} />
      </div>
    </div>
  )
}
