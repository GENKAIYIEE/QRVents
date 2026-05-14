export function ProposalsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
      <div className="p-6 pb-2">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-lg p-3 h-20"></div>
          ))}
        </div>
        <div className="h-3 bg-slate-200 rounded w-1/4 mb-3"></div>
      </div>
      <div className="px-6 pb-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50 h-16 flex justify-between items-center">
            <div className="space-y-2 w-1/2">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
            <div className="space-y-2 w-1/4 flex flex-col items-end">
              <div className="h-5 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
