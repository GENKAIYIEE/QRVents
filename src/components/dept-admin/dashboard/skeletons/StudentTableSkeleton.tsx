export function StudentTableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="w-1/2">
          <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0"></div>
      </div>
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-100 rounded w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-slate-50 rounded w-full flex gap-4 p-2">
            <div className="h-full bg-slate-200 rounded w-1/3"></div>
            <div className="h-full bg-slate-200 rounded w-1/4"></div>
            <div className="h-full bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded w-32"></div>
      </div>
    </div>
  )
}
