"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Search, Filter } from "lucide-react"
import { PenaltyStatusBadge } from "@/components/penalties/penalty-status-badge"
import { ResolvePenaltyModal } from "@/components/penalties/resolve-penalty-modal"

export default function DeptAdminPenaltiesPage() {
  const [penalties, setPenalties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [eventFilter, setEventFilter] = useState("ALL")
  const [selectedPenalty, setSelectedPenalty] = useState<any | null>(null)

  async function loadPenalties() {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== "ALL") params.set("status", statusFilter)
    
    const res = await fetch(`/api/penalties?${params}`)
    const data = await res.json()
    setPenalties(data.penalties || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPenalties()
  }, [statusFilter])

  const filtered = penalties.filter(
    (p) =>
      (eventFilter === "ALL" || p.event.id === eventFilter) &&
      (p.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
       p.event.title.toLowerCase().includes(search.toLowerCase()))
  )

  const uniqueEvents = Array.from(new Set(penalties.map(p => p.event.id))).map(id => {
    return penalties.find(p => p.event.id === id).event
  })

  const pendingCount = penalties.filter((p) => p.status === "PENDING").length
  const overdueCount = penalties.filter((p) => p.status === "OVERDUE").length

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-1">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Attendance Penalties
        </h1>
      </div>
      <p className="text-sm text-[#64748B] mb-6">
        Penalty tracking for your department
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <p className="text-xs text-[#94A3B8] font-medium mb-1">Total Penalties</p>
          <p className="text-2xl font-bold text-[#0F172A]">
            {penalties.length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-700 font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-blue-700">
            {pendingCount}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-700 font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-700">
            {overdueCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student or event..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-sm outline-none max-w-[200px] truncate"
        >
          <option value="ALL">All Events</option>
          {uniqueEvents.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setEventFilter("ALL")
          }}
          className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-lg text-sm outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="RESOLVED">Resolved</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Student</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Event</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Amount/Hours</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Deadline</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-[#475569]">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-[#F1F5F9] animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-5/6 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-12"></div>
                    </td>
                  </tr>
                ))}
              </>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-[#94A3B8]">
                No penalties found.
              </td></tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#0F172A]">
                    {p.student.fullName}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {p.student.email}
                  </p>
                </td>
                 <td className="px-4 py-3 text-[#475569]">
                  <p className="font-medium text-[#0F172A]">{p.event.title}</p>
                  <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                    p.reason === "LATE" 
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : p.reason === "NO_CHECKOUT"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : p.reason === "LATE_AND_NO_CHECKOUT"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {p.reason === "ABSENT" || !p.reason ? "Absent" : p.reason.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#475569]">
                  {p.type ? p.type.replace("_", " ") : "Not chosen yet"}
                </td>
                <td className="px-4 py-3 text-[#475569]">
                  {p.type === "FEE" 
                    ? `₱${p.feeAmount}` 
                    : p.type === "COMMUNITY_SERVICE"
                    ? `${p.serviceHours} hrs`
                    : `₱${p.feeAmount} / ${p.serviceHours} hrs`}
                </td>
                <td className="px-4 py-3 text-[#475569]">
                  {new Date(p.deadline).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <PenaltyStatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3">
                  {(p.status === "PENDING" || p.status === "OVERDUE") && (
                    <button
                      onClick={() => setSelectedPenalty(p)}
                      className="text-xs font-semibold text-[#1A3A8F] hover:underline"
                    >
                      Manage
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPenalty && (
        <ResolvePenaltyModal
          penaltyId={selectedPenalty.id}
          studentName={selectedPenalty.student.fullName}
          isOpen={!!selectedPenalty}
          onClose={() => setSelectedPenalty(null)}
          onResolved={loadPenalties}
        />
      )}
    </div>
  )
}
