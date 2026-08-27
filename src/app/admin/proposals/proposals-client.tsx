"use client"

import { useState, useEffect, useCallback } from "react"
import { ProposalDrawer } from "@/components/admin/proposal-drawer"
import { ArchiveDrawer } from "@/components/admin/archive-drawer"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { toast } from "sonner"
import { CardSkeleton } from "@/components/ui/skeleton"

export function ProposalsClient({ isArchived = false }: { isArchived?: boolean }) {
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
      if (isArchived) {
        query.set("archived", "true")
      } else if (status !== "ALL") {
        query.set("status", status)
      }
      if (search) query.set("search", search)

      const res = await fetch(`/api/admin/proposals?` + query.toString())
      const { data } = await res.json()
      
      setProposals(data.proposals || [])
      setTotalPages(data.pages || 1)

      router.replace(pathname + "?" + query.toString(), { scroll: false })
    } catch {
      toast.error("Failed to load proposals")
    } finally {
      setLoading(false)
    }
  }, [page, status, search, pathname, router, isArchived])

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
    ARCHIVED: { color: "text-slate-600", bg: "bg-slate-200" },
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <Link 
          href="/admin/proposals"
          className={"px-4 py-3 text-sm font-bold border-b-2 transition-all " + (!isArchived ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}
        >
          Active Proposals
        </Link>
        <Link 
          href="/admin/proposals/archived"
          className={"px-4 py-3 text-sm font-bold border-b-2 transition-all " + (isArchived ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300")}
        >
          Archived Proposals
        </Link>
      </div>

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
        {!isArchived && (
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
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
            <span className="material-symbols-outlined text-slate-400 text-[36px] [font-variation-settings:'FILL'_0,'wght'_300]">assignment</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No proposals found</h3>
          <p className="text-slate-500 text-[15px] max-w-md text-center leading-relaxed font-medium">
            {isArchived ? "There are no archived proposals." : (status !== "ALL" ? "There are no " + status.toLowerCase() + " proposals at the moment." : "Departments haven't submitted any proposals yet.")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proposals.map((proposal) => {
              const statusCfg = proposal.isArchived ? statusConfig["ARCHIVED"] : (statusConfig[proposal.status] || { color: "text-slate-700", bg: "bg-slate-100" })
              
              return (
                <div 
                  key={proposal.id}
                  onClick={() => openDrawer(proposal)}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={"px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider " + statusCfg.bg + " " + statusCfg.color}>
                      {proposal.isArchived ? "ARCHIVED" : proposal.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-lg">
                      {format(new Date(proposal.submittedAt), "MMM d")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors" title={proposal.title}>
                    {proposal.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="line-clamp-1">{proposal.venue}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">domain</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">
                          {proposal.department?.name || "School-Wide"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          by {proposal.submittedBy?.fullName || "Admin"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drawers */}
      {selectedProposal?.isArchived ? (
        <ArchiveDrawer 
          proposal={selectedProposal}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedProposal(null)
          }}
          onSuccess={() => {
            setIsDrawerOpen(false)
            setSelectedProposal(null)
            fetchProposals()
          }}
        />
      ) : (
        <ProposalDrawer 
          proposal={selectedProposal}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedProposal(null)
          }}
          onSuccess={() => {
            setIsDrawerOpen(false)
            setSelectedProposal(null)
            fetchProposals()
          }}
        />
      )}
    </div>
  )
}
