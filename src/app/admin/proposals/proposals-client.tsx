"use client"

import { useState, useEffect } from "react"
import { ProposalDrawer } from "@/components/admin/proposal-drawer"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"

export function ProposalsClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  
  // Filters
  const [status, setStatus] = useState<string>(searchParams.get("status") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (status !== "ALL") query.set("status", status)

      const res = await fetch(`/api/admin/proposals?${query.toString()}`)
      const { data } = await res.json()
      
      setProposals(data.proposals || [])
      setTotalPages(data.pages || 1)

      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch (err) {
      console.error("Failed to fetch proposals", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [page, status])

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
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Proposals</span>
        </div>
        <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.5px", margin: 0 }}>Event Proposals</h1>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
        <div style={{ flex: "1 1 auto", position: "relative", minWidth: "250px" }}>
          <span className="material-symbols-outlined absolute text-slate-400" style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}>search</span>
          <input 
            type="text" 
            placeholder="Search proposals (coming soon)..."
            disabled
            style={{ width: "100%", padding: "12px 16px 12px 48px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", outline: "none", fontSize: "15px", opacity: 0.6, cursor: "not-allowed" }}
          />
        </div>
        <div style={{ width: "100%", maxWidth: "220px", flexShrink: 0 }}>
          <select 
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ width: "100%", padding: "12px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", outline: "none", fontWeight: 600, color: "#334155", fontSize: "15px", cursor: "pointer", appearance: "auto" }}
            className="focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {tabs.map((tab) => (
              <option key={tab.value} value={tab.value}>{tab.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <span className="material-symbols-outlined text-4xl text-slate-400">assignment</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">No proposals found</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-sm text-center leading-relaxed">
            {status !== "ALL" ? `There are no ${status.toLowerCase()} proposals at the moment.` : "Departments haven't submitted any proposals yet. New proposals will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proposals.map((proposal) => {
              const statusCfg = statusConfig[proposal.status] || { color: "text-slate-700", bg: "bg-slate-100" }
              
              return (
                <div 
                  key={proposal.id}
                  onClick={() => openDrawer(proposal)}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.color}`}>
                      {proposal.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {format(new Date(proposal.submittedAt), "MMM d")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1" title={proposal.title}>
                    {proposal.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                      style={{ backgroundColor: proposal.department.color }}
                    >
                      {proposal.department.code[0]}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 truncate">
                      {proposal.department.name}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      <span className="truncate">{format(new Date(proposal.date), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="truncate">{proposal.venue}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="px-4 py-2 font-medium text-slate-600">
                Page {page} of {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
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
