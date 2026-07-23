"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"
import { ArchiveDrawer } from "@/components/admin/archive-drawer"

export function ArchivesClient() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchArchives = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      query.set("archived", "true")
      if (search) query.set("search", search)

      const res = await fetch(`/api/admin/proposals?${query.toString()}`)
      const { data } = await res.json()
      
      setProposals(data.proposals || [])
      setTotalPages(data.pages || 1)

      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch {
      toast.error("Failed to load archives")
    } finally {
      setLoading(false)
    }
  }, [page, search, pathname, router])

  useEffect(() => {
    fetchArchives()
  }, [fetchArchives])

  const openDrawer = (proposal: any) => {
    setSelectedProposal(proposal)
    setIsDrawerOpen(true)
  }

  const handleExportCSV = () => {
    if (proposals.length === 0) {
      toast.error("No archives to backup")
      return
    }

    const headers = ["Title", "Department", "Venue", "Date", "Status", "Archived On"]
    const rows = proposals.map((p: any) => [
      p.title,
      p.department?.name || "Unknown",
      p.venue,
      format(new Date(p.date), "yyyy-MM-dd"),
      p.status,
      format(new Date(p.updatedAt), "yyyy-MM-dd HH:mm")
    ])

    const csvContent = [
      `# QRVents Archives Backup`,
      `# Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
      "",
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qrvents-archives-backup-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success("Backup downloaded successfully")
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">

      {/* Filter & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex-1 w-full relative min-w-[250px] max-w-lg">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 [font-variation-settings:'FILL'_1]">search</span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search archives by title, venue, or department..."
            className="w-full py-3 pr-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all font-medium"
          />
        </div>
        
        <button 
          onClick={handleExportCSV}
          disabled={loading || proposals.length === 0}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 text-sm"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Backup Archive (CSV)
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-slate-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner text-slate-400">
            <span className="material-symbols-outlined text-[36px] [font-variation-settings:'FILL'_0,'wght'_300]">inventory_2</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No archives found</h3>
          <p className="text-slate-500 text-[15px] max-w-md text-center leading-relaxed font-medium">
            There are currently no archived proposals in the system.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proposals.map((proposal) => {
              return (
                <div 
                  key={proposal.id}
                  onClick={() => openDrawer(proposal)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 border-dashed shadow-sm hover:border-solid hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col group opacity-80 hover:opacity-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">archive</span>
                      Archived
                    </span>
                    <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2 py-1 rounded-lg">
                      {format(new Date(proposal.date), "yyyy")}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-2 group-hover:text-slate-600 transition-colors" title={proposal.title}>
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

      <ArchiveDrawer 
        proposal={selectedProposal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={fetchArchives}
      />
    </div>
  )
}
