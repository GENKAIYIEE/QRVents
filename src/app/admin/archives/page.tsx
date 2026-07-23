import { Suspense } from "react"
import { ArchivesClient } from "./archives-client"

export default function ArchivesPage() {
  return (
    <div className="flex-1 w-full flex flex-col pt-24 md:pt-10 px-4 md:px-8 pb-10">
      <div className="max-w-[1400px] w-full mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900 font-semibold">Archives</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <span className="material-symbols-outlined text-[24px]">archive</span>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Archives</h1>
              <p className="text-slate-500 font-medium mt-1">Manage historical records and permanently delete or restore archived proposals.</p>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
          </div>
        }>
          <ArchivesClient />
        </Suspense>

      </div>
    </div>
  )
}
