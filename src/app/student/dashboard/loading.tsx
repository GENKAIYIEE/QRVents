import { StudentLayoutWrapper } from "@/components/student/dashboard/StudentLayoutWrapper"

export default function DashboardLoading() {
  const dummySession = {
    userId: "loading",
    email: "...",
    role: "STUDENT",
    fullName: "Loading...",
  }

  return (
    <StudentLayoutWrapper 
      session={dummySession}
      department={null}
      studentUser={null}
    >
      <div className="flex flex-col gap-6 w-full max-w-full pb-10 animate-pulse">
        {/* StatCards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 h-[116px]">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="w-8 h-8 rounded-full bg-slate-50" />
              </div>
              <div className="w-24 h-6 rounded-md bg-slate-100 mb-1" />
              <div className="w-32 h-4 rounded-md bg-slate-50" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
                <div className="p-5 flex items-center justify-between border-b border-slate-50/50 bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div>
                      <div className="w-48 h-5 bg-slate-200 rounded-md mb-2" />
                      <div className="w-32 h-3 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="h-[140px] rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-slate-50/50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div>
                    <div className="w-32 h-5 bg-slate-200 rounded-md mb-2" />
                    <div className="w-24 h-3 bg-slate-100 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-0">
                <div className="divide-y divide-slate-50">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="p-5 flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                      <div className="flex-1">
                        <div className="w-full h-4 bg-slate-200 rounded-md mb-2" />
                        <div className="w-24 h-3 bg-slate-100 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayoutWrapper>
  )
}
