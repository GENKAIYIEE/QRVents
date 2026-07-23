"use client"

import { useState, useEffect, useCallback } from "react"
import { ProposalDrawer } from "@/components/admin/proposal-drawer"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"

export function ProposalsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState<string>(searchParams.get("status") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (status !== "ALL") query.set("status", status)
      if (search) query.set("search", search)

      const res = await fetch(`/api/admin/proposals?${query.toString()}`)
      const { data } = await res.json()
      
      setProposals(data.proposals || [])
      setTotalPages(data.pages || 1)

      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch {
      toast.error("Failed to load proposals")
    } finally {
      setLoading(false)
    }
  }, [page, status, search, pathname, router])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  const openDrawer = (proposal: any) => {
    setSelectedProposal(proposal)
    setIsDrawerOpen(true)
  }

  const tabs = [
    { label: "All Proposals", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Rejected", value: "REJECTED" },
  ]

  const statusConfig: Record<string, { color: string, bg: string }> = {
    PENDING: { color: "text-amber-700", bg: "bg-amber-100" },
    APPROVED: { color: "text-emerald-700", bg: "bg-emerald-100" },
    ON_HOLD: { color: "text-purple-700", bg: "bg-purple-100" },
    REJECTED: { color: "text-rose-700", bg: "bg-rose-100" },
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">


      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex-1 w-full relative min-w-[250px]">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 [font-variation-settings:'FILL'_1]">search</span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, venue, or department..."
            className="w-full py-3 pr-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="w-full md:w-[220px] shrink-0">
          <select 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            {tabs.map((tab) => (
              <option key={tab.value} value={tab.value}>{tab.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <span className="material-symbols-outlined text-slate-400 text-[36px] [font-variation-settings:'FILL'_0,'wght'_300]">assignment</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No proposals found</h3>
          <p className="text-slate-500 text-[15px] max-w-md text-center leading-relaxed font-medium">
            {status !== "ALL" ? `There are no ${status.toLowerCase()} proposals at the moment.` : "Departments haven't submitted any proposals yet. New proposals will appear here."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proposals.map((proposal) => {
              const statusCfg = statusConfig[proposal.status] || { color: "text-slate-700", bg: "bg-slate-100" }
              
              return (
                <div 
                  key={proposal.id}
                  onClick={() => openDrawer(proposal)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color}`}>
                      {proposal.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-lg">
                      {format(new Date(proposal.submittedAt), "MMM d")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors" title={proposal.title}>
                    {proposal.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-5">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: proposal.department.color }}
                    >
                      {proposal.department.code[0]}
                    </div>
                    <span className="text-sm font-semibold text-slate-600 truncate">
                      {proposal.department.name}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                      <span className="truncate">{format(new Date(proposal.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span className="truncate">{proposal.venue}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
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
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ProposalDrawer 
        proposal={selectedProposal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchProposals}
      />
    </div>
  )
}
