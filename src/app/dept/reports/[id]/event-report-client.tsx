"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronLeft, ChevronRight, Download, Archive, ArchiveRestore, Trash2, AlertCircle } from "lucide-react"
import { getEventStatistics, getEventAttendees, archiveEventAction, deleteEventAction } from "./actions"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PdfExportButton } from "@/components/reports/pdf-export-button"

interface EventData {
  id: string
  title: string
  date: Date
  status: string
  isArchived?: boolean
}

interface StatData {
  total: number
  byYear: { name: string; value: number }[]
  bySection: { name: string; value: number }[]
}

export function EventReportClient({ event }: { event: EventData }) {
  const [stats, setStats] = useState<StatData | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  
  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState("ALL")
  const [sectionFilter, setSectionFilter] = useState("ALL")

  const fetchStats = useCallback(async () => {
    try {
      const data = await getEventStatistics(event.id)
      setStats(data)
    } catch (e) {
      console.error(e)
    }
  }, [event.id])

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getEventAttendees(event.id, currentPage, 10, yearFilter, sectionFilter, search)
      setLogs(data.logs)
      setTotal(data.total)
      setPages(data.pages)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [event.id, currentPage, yearFilter, sectionFilter, search])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, yearFilter, sectionFilter])

  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleToggleArchive = async () => {
    setIsArchiving(true)
    try {
      await archiveEventAction(event.id, !event.isArchived)
      toast.success(`Report ${event.isArchived ? "restored to active" : "archived"} successfully.`)
      router.push(event.isArchived ? "/dept/reports" : "/dept/reports/archived")
    } catch (e) {
      toast.error("Failed to update report status.")
      setIsArchiving(false)
      setShowArchiveModal(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteEventAction(event.id)
      toast.success("Archived report permanently deleted.")
      router.push("/dept/reports/archived")
    } catch (e) {
      toast.error("Failed to delete the report.")
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dept/reports" className="text-blue-500 font-bold text-sm mb-2 flex items-center gap-1 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Reports
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {event.title}
            {event.isArchived && (
              <span className="text-xs font-bold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-lg">Archived</span>
            )}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {format(new Date(event.date), "MMMM d, yyyy")}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {event.isArchived && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl shadow-sm transition-all bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
            >
              <Trash2 className="w-4 h-4" /> Permanent Delete
            </button>
          )}
          <button
            onClick={() => setShowArchiveModal(true)}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl shadow-sm transition-all ${
              event.isArchived 
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" 
                : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {event.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            {event.isArchived ? "Restore Report" : "Archive Report"}
          </button>
          
          <PdfExportButton 
            eventId={event.id}
            departmentId=""
            eventName={event.title}
          />
        </div>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
               <span className="material-symbols-outlined text-[24px]">groups</span>
             </div>
             <div className="text-3xl font-black text-slate-900">{stats.total}</div>
             <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total Attendees</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">By Year Level</h3>
            <div className="space-y-3">
              {stats.byYear.length === 0 && <div className="text-xs text-slate-400">No data</div>}
              {stats.byYear.map(y => (
                <div key={y.name} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-600">{y.name === "Unknown" ? "Unspecified" : `${y.name} Year`}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{y.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-64 overflow-y-auto scrollbar-thin">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">By Section</h3>
            <div className="space-y-3">
              {stats.bySection.length === 0 && <div className="text-xs text-slate-400">No data</div>}
              {stats.bySection.map(s => (
                <div key={s.name} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-600">Section {s.name === "Unknown" ? "?" : s.name}</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attendee List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="flex-1 md:w-32 px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white"
            >
              <option value="ALL">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            
            <div className="relative flex-1 md:w-32">
              <input 
                type="text" 
                placeholder="Section (e.g. A)"
                value={sectionFilter === "ALL" ? "" : sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value || "ALL")}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider">Yr & Sec</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Time In</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Time Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading attendees...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No attendees found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-800 text-sm">{log.user.fullName}</div>
                      <div className="text-xs text-slate-500">{log.user.studentId || "No ID"}</div>
                    </td>
                    <td className="px-6 py-3">
                       {log.user.department ? (
                          <span 
                            className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{ 
                              backgroundColor: log.user.department.color + '15',
                              color: log.user.department.color,
                            }}
                          >
                            {log.user.department.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                    </td>
                    <td className="px-6 py-3">
                       <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                         {log.user.yearLevel || "?"} <span className="text-slate-300">-</span> {log.user.section || "?"}
                       </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                       <span className="text-sm font-medium text-slate-700">
                         {format(new Date(log.checkIn), "hh:mm a")}
                       </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                       <span className="text-sm font-medium text-slate-700">
                         {log.checkOut ? format(new Date(log.checkOut), "hh:mm a") : <span className="text-slate-400 italic">No Check-out</span>}
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              Showing page <span className="font-bold text-slate-700">{currentPage}</span> of {pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                disabled={currentPage === pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 text-center flex flex-col items-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border ${
                event.isArchived 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {event.isArchived 
                  ? <ArchiveRestore className="w-10 h-10" /> 
                  : <Archive className="w-10 h-10" />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {event.isArchived ? "Restore Report?" : "Archive Report?"}
              </h3>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">
                {event.isArchived 
                  ? "This report will be moved back to your active list."
                  : "This report will be hidden from the active list and moved to the archives."}
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowArchiveModal(false)}
                  disabled={isArchiving}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleToggleArchive}
                  disabled={isArchiving}
                  className={`flex-1 py-3 px-4 font-bold rounded-xl transition-colors text-white disabled:opacity-50 shadow-sm ${
                    event.isArchived ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {isArchiving ? "Updating..." : "Yes, Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-rose-100">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Delete Report?</h3>
              <p className="text-slate-500 text-[15px] mb-8 leading-relaxed font-medium">
                Are you sure you want to permanently delete <span className="font-bold text-slate-800">"{event.title}"</span>? This will wipe the event and all its attendance records from the database. This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-rose-500/20"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
