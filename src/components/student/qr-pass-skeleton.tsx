export function QrPassSkeleton() {
  return (
    <div className="max-w-md mx-auto w-full flex flex-col gap-6 pb-10 animate-pulse">
      {/* Student Pass Card Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Card Header Skeleton */}
        <div className="px-6 py-5 bg-slate-200/90">
          <div className="h-6 w-44 bg-slate-300/80 rounded-md mb-2" />
          <div className="h-4 w-56 bg-slate-300/60 rounded-md" />
        </div>

        {/* QR Section Skeleton */}
        <div className="px-6 py-6 flex flex-col items-center">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="w-[200px] h-[200px] bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-200/70" />
            </div>
          </div>
          <div className="h-4 w-64 bg-slate-100 rounded-md mt-4" />
          <div className="h-3 w-48 bg-slate-100 rounded-md mt-2" />

          {/* Action Buttons Skeleton */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <div className="h-11 rounded-xl bg-white border border-slate-200" />
            <div className="h-11 rounded-xl bg-slate-200" />
          </div>
        </div>
      </section>

      {/* Today's Events Skeleton */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2].map((i) => (
            <div key={i} className="px-5 py-4 flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="h-4 w-40 bg-slate-200 rounded-md mb-2" />
                <div className="h-3 w-32 bg-slate-100 rounded-md mb-1.5" />
                <div className="h-3 w-24 bg-slate-100 rounded-md" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
