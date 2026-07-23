"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

interface AttendanceViewerProps {
  events: any[]
  departments: any[]
}

export function AttendanceViewer({ events, departments }: AttendanceViewerProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(events.length > 0 ? events[0].id : "")
  
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Filters
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("ALL")
  const [departmentId, setDepartmentId] = useState("ALL")
  const [yearLevel, setYearLevel] = useState("ALL")
  const [section, setSection] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = async (showLoading = true) => {
    if (!selectedEventId) return
    if (showLoading) setLoading(true)
    
    try {
      const query = new URLSearchParams()
      query.set("eventId", selectedEventId)
      query.set("page", page.toString())
      if (search) query.set("search", search)
      if (status !== "ALL") query.set("status", status)
      if (departmentId !== "ALL") query.set("departmentId", departmentId)
      if (yearLevel !== "ALL") query.set("yearLevel", yearLevel)
      if (section !== "ALL") query.set("section", section)

      const res = await fetch(`/api/admin/attendance?${query.toString()}`)
      const { data } = await res.json()
      
      setLogs(data.logs || [])
      setTotalPages(data.pages || 1)
      setStats(data.stats)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch logs", err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Initial fetch and dependency fetch
  useEffect(() => {
    fetchLogs(true)
  }, [selectedEventId, page, search, status, departmentId, yearLevel, section])

  // Polling
  useEffect(() => {
    if (!autoRefresh || !selectedEventId) return
    
    const interval = setInterval(() => {
      fetchLogs(false) // hidden fetch
    }, 15000) // Poll every 15s
    
    return () => clearInterval(interval)
  }, [autoRefresh, selectedEventId, page, search, status, departmentId, yearLevel, section])

  const handleExport = () => {
    if (!logs.length || !selectedEventId) return

    const query = new URLSearchParams()
    query.set("eventId", selectedEventId)
    if (search) query.set("search", search)
    if (status !== "ALL") query.set("status", status)
    if (departmentId !== "ALL") query.set("departmentId", departmentId)
    if (yearLevel !== "ALL") query.set("yearLevel", yearLevel)
    if (section !== "ALL") query.set("section", section)

    window.location.href = `/api/admin/attendance/export?${query.toString()}`
  }

  const selectedEvent = events.find(e => e.id === selectedEventId)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Select Event to Monitor
          </label>
          <div className="relative">
            <select 
              value={selectedEventId}
              onChange={(e) => { setSelectedEventId(e.target.value); setPage(1); }}
              className="w-full md:w-96 appearance-none bg-white rounded-lg border border-slate-300 shadow-sm px-4 py-2.5 pr-10 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow cursor-pointer"
            >
              {events.length === 0 && <option value="">No active events found</option>}
              {events.map(e => (
                <option key={e.id} value={e.id}>
                  {e.status === 'ONGOING' ? '🟢 ' : (e.status === 'UPCOMING' ? '🔵 ' : '⚪ ')} 
                  {e.title} ({format(new Date(e.date), "MMM d")})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto pb-0.5">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
              autoRefresh 
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${autoRefresh ? 'animate-pulse' : ''}`}>
              {autoRefresh ? 'sensors' : 'sensors_off'}
            </span>
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          
          <button 
            onClick={handleExport}
            disabled={!selectedEventId || logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-white"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
      </div>

      {selectedEventId && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Checked In</div>
            <div className="text-3xl font-black text-slate-800">{stats.total}</div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <span className="material-symbols-outlined text-8xl">groups</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Present</div>
            <div className="text-3xl font-black text-emerald-700">{stats.present}</div>
            <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-500">
              <span className="material-symbols-outlined text-8xl">check_circle</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Guests</div>
            <div className="text-3xl font-black text-amber-700">{stats.guest}</div>
            <div className="absolute -right-4 -bottom-4 opacity-5 text-amber-500">
              <span className="material-symbols-outlined text-8xl">person_add</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Checked Out</div>
            <div className="text-3xl font-black text-slate-600">{stats.checkedOut}</div>
            <div className="absolute -right-4 -bottom-4 opacity-5">
              <span className="material-symbols-outlined text-8xl">logout</span>
            </div>
          </div>
        </div>
      )}

      {selectedEventId && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search student..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <select 
                value={departmentId}
                onChange={(e) => { setDepartmentId(e.target.value); setPage(1); }}
                className="flex-1 lg:w-32 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">All Depts</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.code}</option>
                ))}
              </select>

              <select 
                value={yearLevel}
                onChange={(e) => { setYearLevel(e.target.value); setPage(1); }}
                className="flex-1 lg:w-28 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <div className="relative flex-1 lg:w-28">
                <input 
                  type="text" 
                  placeholder="Section (e.g. A)"
                  value={section === "ALL" ? "" : section}
                  onChange={(e) => { setSection(e.target.value || "ALL"); setPage(1); }}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
                />
              </div>
              
              <select 
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="flex-1 lg:w-32 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
              >
                <option value="ALL">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="GUEST">Guest</option>
                <option value="CHECKED_OUT">Checked Out</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/40 backdrop-blur-[2px] z-10 animate-in fade-in duration-300">
                <div className="bg-white px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center gap-4 border border-slate-100/50">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 tracking-wide">Syncing records...</span>
                </div>
              </div>
            )}
            
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 shadow-sm z-0">
                <tr>
                  <th className="px-6 py-3">Attendee</th>
                  <th className="px-6 py-3">ID / Yr & Sec</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-4xl">qr_code_scanner</span>
                      </div>
                      <div className="font-semibold text-slate-600">No attendance records found</div>
                      <div className="text-xs text-slate-400 mt-1">Students scanning their QR codes will appear here instantly.</div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors animate-in fade-in">
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-800">{log.user.fullName}</div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-slate-600 font-mono text-xs">{log.user.studentId || '-'}</div>
                        <div className="text-xs text-slate-400">
                          {log.user.yearLevel ? `Year ${log.user.yearLevel}` : '-'}
                          {log.user.section ? ` / Sec ${log.user.section}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {log.user.department ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: log.user.department.color }} />
                            <span className="font-semibold text-slate-700">{log.user.department.code}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-slate-700 font-medium">{format(new Date(log.checkIn), "hh:mm:ss a")}</div>
                        {log.checkOut && (
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">logout</span>
                            {format(new Date(log.checkOut), "hh:mm a")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                          log.status === 'GUEST' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {log.status === 'PRESENT' && <span className="material-symbols-outlined text-[12px]">check</span>}
                          {log.status === 'GUEST' && <span className="material-symbols-outlined text-[12px]">person</span>}
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
            <div className="text-slate-500">
              Last updated: <span className="font-medium text-slate-700">{lastUpdated ? format(lastUpdated, "hh:mm:ss a") : "--:--:--"}</span>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-semibold text-slate-600">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
