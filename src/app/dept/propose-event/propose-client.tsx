"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ProposalStatus } from "@prisma/client"
import { getProposals } from "./actions"

interface Proposal {
  id: string
  title: string
  date: Date
  venue: string
  status: string
  rejectionReason: string | null
  submittedAt: Date
}

interface InitialData {
  proposals: Proposal[]
  total: number
  pages: number
}

export function ProposeEventClient({ initialData }: { initialData: InitialData }) {
  const [proposals, setProposals] = useState<Proposal[]>(initialData.proposals)
  const [total, setTotal] = useState(initialData.total)
  const [pages, setPages] = useState(initialData.pages)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState<ProposalStatus | "ALL">("ALL")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getProposals(currentPage, 10, activeTab)
      setProposals(data.proposals)
      setTotal(data.total)
      setPages(data.pages)
    } catch (err) {
      toast.error("Failed to load proposals.")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, activeTab])

  useEffect(() => {
    // We skip fetching on initial mount for ALL/page 1 since it comes from server
    if (activeTab === "ALL" && currentPage === 1 && !isLoading && proposals.length === initialData.proposals.length) {
      return
    }
    fetchProposals()
  }, [fetchProposals, activeTab, currentPage])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      venue: formData.get("venue"),
      hasCertificate: formData.get("hasCertificate") === "true",
      isMandatory: formData.get("isMandatory") === "true",
      targetYearLevels: formData.getAll("targetYearLevels"),
    }

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit proposal")
      }

      toast.success("Proposal submitted successfully!")
      
      // Refresh the list
      if (currentPage === 1 && activeTab !== "APPROVED" && activeTab !== "REJECTED") {
        fetchProposals()
      } else {
        setActiveTab("ALL")
        setCurrentPage(1)
      }
      
      // Reset form
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Form Column */}
      <div className="xl:col-span-1">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500">add_circle</span>
            New Proposal
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Title</label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Annual IT Symposium"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Start Time</label>
                <input 
                  type="time" 
                  name="startTime" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">End Time</label>
                <input 
                  type="time" 
                  name="endTime" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Venue</label>
              <input 
                name="venue" 
                required 
                placeholder="e.g. Main Auditorium"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-700">Target Year Levels</label>
                <button 
                  type="button" 
                  onClick={() => {
                    const checkboxes = document.querySelectorAll('input[name="targetYearLevels"]') as NodeListOf<HTMLInputElement>;
                    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                    checkboxes.forEach(cb => cb.checked = !allChecked);
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                >
                  Select All / None
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-2">You can specify year levels, or leave all unchecked to target everyone.</p>
              <div className="flex flex-wrap gap-3">
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                  <label key={year} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <input 
                      type="checkbox"
                      name="targetYearLevels"
                      value={year}
                      className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    {year}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
              <textarea 
                name="description" 
                rows={3}
                placeholder="Brief details about the event..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="isMandatory"
                  name="isMandatory"
                  value="true"
                  className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="isMandatory" className="block text-sm font-bold text-slate-700 cursor-pointer">
                    Mandatory Event
                  </label>
                  <p className="text-xs text-slate-500">Students who fail to attend will receive penalties.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="hasCertificate"
                  name="hasCertificate"
                  value="true"
                  className="w-5 h-5 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="hasCertificate" className="block text-sm font-bold text-slate-700 cursor-pointer">
                    With Certificate
                  </label>
                  <p className="text-xs text-slate-500">Provide certificates for students who complete this event.</p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">send</span>
              )}
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </form>
        </div>
      </div>

      {/* List Column */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-3xl p-2 sm:p-6 shadow-sm border border-slate-100 h-full">
          <div className="px-4 py-2 flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Your Proposals</h2>
              <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {total} Total
              </div>
            </div>

            <div className="flex gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as any)
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inbox</span>
              <h3 className="text-lg font-bold text-slate-700">No Proposals Yet</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">When you submit an event proposal, it will appear here so you can track its approval status.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {proposals.map((prop) => (
                <div key={prop.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-3 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{prop.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
                        prop.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        prop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        prop.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">event</span> {format(new Date(prop.date), "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">location_on</span> {prop.venue}</span>
                    </div>

                    {prop.status === 'REJECTED' && prop.rejectionReason && (
                      <div className="mt-2 p-2 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-100 flex gap-1.5">
                        <span className="material-symbols-outlined text-[14px] shrink-0 text-rose-500">info</span>
                        <div>
                          <strong className="font-bold">Rejected:</strong> {prop.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-[11px] text-slate-500">
                      Submitted on <span className="font-medium text-slate-700">{format(new Date(prop.submittedAt), "MMM d")}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm font-medium text-slate-500">
                    Page <span className="font-bold text-slate-700">{currentPage}</span> of {pages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || isLoading}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                      disabled={currentPage === pages || isLoading}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
