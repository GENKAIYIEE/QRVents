export function EventsListSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      </div>
      <div className="divide-y divide-slate-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-6">
            <div className="h-5 bg-slate-200 rounded w-1/2 mb-3"></div>
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-6 bg-slate-200 rounded w-20"></div>
              <div className="h-6 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
