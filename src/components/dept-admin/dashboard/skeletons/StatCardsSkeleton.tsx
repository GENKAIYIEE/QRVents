export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200" />
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-3 w-full">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0"></div>
          </div>
          <div className="h-3 bg-slate-200 rounded w-2/3 mt-6"></div>
        </div>
      ))}
    </div>
  )
}
