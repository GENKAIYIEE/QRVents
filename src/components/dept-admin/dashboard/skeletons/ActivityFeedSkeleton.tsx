export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="p-6">
        <div className="ml-4 border-l-2 border-slate-100 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative pl-6">
              <div className="absolute -left-[13px] top-0 w-6 h-6 rounded-full bg-slate-200 border-4 border-white"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
