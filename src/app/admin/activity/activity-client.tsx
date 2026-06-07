"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function ActivityClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (search) query.set("search", search)

      const res = await fetch(`/api/admin/activity?${query.toString()}`)
      const { data } = await res.json()
      
      setLogs(data.logs || [])
      setTotalPages(data.pages || 1)

      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch (err) {
      console.error("Failed to fetch activity logs", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  // Don't auto-fetch on every search stroke, use a submit or delay
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
            <span className="text-slate-400 text-xs font-semibold">/</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Audit</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Activity Log</h1>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              type="text" 
              placeholder="Search actions, details, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">history_toggle_off</span>
          <h3 className="text-lg font-bold text-slate-700">No activity logs found</h3>
          <p className="text-slate-500 text-sm mt-1">Try a different search term or check back later.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      <div>{format(new Date(log.createdAt), "MMM d, yyyy")}</div>
                      <div className="text-xs">{format(new Date(log.createdAt), "hh:mm:ss a")}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {log.userName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-bold uppercase tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[300px]" title={log.details || ""}>
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-slate-100">
              <button 
                disabled={page === 1}
                onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="px-4 py-2 font-medium text-slate-600">
                Page {page} of {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0); }}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
