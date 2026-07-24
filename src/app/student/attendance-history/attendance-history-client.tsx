"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { getStudentAttendanceHistory } from "./actions"
import { formatTimeString, calculateDuration } from "@/lib/utils"

export function AttendanceHistoryClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("typeFilter") || "ALL")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("statusFilter") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await getStudentAttendanceHistory(page, 10, search, typeFilter, statusFilter)
      setLogs(res.logs || [])
      setTotalPages(res.pages || 1)

      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (search) query.set("search", search)
      if (typeFilter !== "ALL") query.set("typeFilter", typeFilter)
      if (statusFilter !== "ALL") query.set("statusFilter", statusFilter)
      
      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch (err) {
      console.error("Failed to fetch history", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, typeFilter, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchHistory()
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">


      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleSearch} className="flex-1 w-full relative min-w-[250px] flex">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 [font-variation-settings:'FILL'_1]">search</span>
          <input 
            type="text" 
            placeholder="Search events or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pr-4 pl-12 bg-slate-50 border border-slate-200 rounded-l-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
          />
          <button type="submit" className="px-6 bg-slate-800 text-white font-bold rounded-r-xl border border-slate-800 hover:bg-slate-900 transition-colors">
            Search
          </button>
        </form>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <select 
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-[160px] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="ALL">All Events</option>
            <option value="SCHOOL_WIDE">School-Wide</option>
            <option value="DEPARTMENT">Department</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-[140px] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="ALL">All Status</option>
            <option value="ATTENDED">Attended</option>
            <option value="MISSED">Missed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <span className="material-symbols-outlined text-slate-400 text-[36px] [font-variation-settings:'FILL'_0,'wght'_300]">history_toggle_off</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No attendance records found</h3>
          <p className="text-slate-500 text-[15px] max-w-md text-center leading-relaxed font-medium">
            No past events match your current search and filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Check In</th>
                  <th className="px-6 py-4">Check Out</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const eventDate = new Date(log.event.date)
                  const isSchoolWide = log.event.eventType === "SCHOOL_WIDE"
                  const isGuest = log.status === "GUEST"
                  const isMissed = log.status === "MISSED"

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMissed ? 'bg-rose-50 text-rose-500 opacity-60' : isSchoolWide ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {isMissed ? 'event_busy' : isSchoolWide ? 'account_balance' : 'corporate_fare'}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{log.event.title}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {log.event.venue}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{format(eventDate, "MMM d, yyyy")}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {formatTimeString(log.event.startTime)} - {formatTimeString(log.event.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isMissed ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                            Missed
                          </span>
                        ) : isGuest ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                            Guest
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Present
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isMissed ? (
                          <span className="text-slate-300 text-xs font-semibold italic">--</span>
                        ) : (
                          <>
                            <div className="font-medium text-slate-700">{format(new Date(log.checkIn), "hh:mm a")}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Logged In</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isMissed || !log.checkOut ? (
                          <span className="text-slate-300 text-xs font-semibold italic">--</span>
                        ) : (
                          <>
                            <div className="font-medium text-slate-700">{format(new Date(log.checkOut), "hh:mm a")}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Logged Out</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isMissed || !log.checkOut ? (
                          <span className="text-slate-300 text-xs font-semibold italic">--</span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold text-xs border border-slate-200">
                            <span className="material-symbols-outlined text-[14px]">timer</span>
                            {calculateDuration(log.checkIn, log.checkOut)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isMissed && log.event.status === "COMPLETED" ? (
                           <a href={`/student/certificates/${log.event.id}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs transition-colors shadow-sm shadow-amber-500/20">
                             <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                             Generate
                           </a>
                        ) : (
                           <span className="text-slate-300 text-xs font-semibold italic">--</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 p-4 border-t border-slate-100 bg-slate-50/50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Prev
              </button>
              <div className="px-4 py-2 font-bold text-slate-500 text-sm bg-white border border-slate-100 rounded-lg shadow-sm">
                {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
