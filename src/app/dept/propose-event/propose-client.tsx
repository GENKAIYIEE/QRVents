"use client"

import { useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Proposal {
  id: string
  title: string
  date: Date
  venue: string
  status: string
  rejectionReason: string | null
  submittedAt: Date
}

export function ProposeEventClient({ initialProposals }: { initialProposals: Proposal[] }) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      
      // Optimistically add to list
      setProposals([{ ...result.proposal, date: new Date(result.proposal.date), submittedAt: new Date(result.proposal.submittedAt) }, ...proposals])
      
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
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description (Optional)</label>
              <textarea 
                name="description" 
                rows={3}
                placeholder="Brief details about the event..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
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
          <div className="px-4 py-2 flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Proposals</h2>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {proposals.length} Total
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inbox</span>
              <h3 className="text-lg font-bold text-slate-700">No Proposals Yet</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">When you submit an event proposal, it will appear here so you can track its approval status.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all bg-white group flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-extrabold text-slate-900 text-lg truncate">{prop.title}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${
                        prop.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        prop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        prop.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">event</span> {format(new Date(prop.date), "MMM d, yyyy")}</span>
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">location_on</span> {prop.venue}</span>
                    </div>

                    {prop.status === 'REJECTED' && prop.rejectionReason && (
                      <div className="mt-3 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs font-medium border border-rose-100 flex gap-2">
                        <span className="material-symbols-outlined text-[16px] shrink-0 text-rose-500">info</span>
                        <div>
                          <strong className="block mb-0.5 font-bold">Reason for Rejection:</strong>
                          {prop.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submitted</div>
                    <div className="text-sm font-semibold text-slate-700">{format(new Date(prop.submittedAt), "MMM d, h:mm a")}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
