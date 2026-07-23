"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ProposalStatus } from "@prisma/client"
import { toast } from "sonner"
import { formatTimeString } from "@/lib/utils"

interface ProposalDrawerProps {
  proposal: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ProposalDrawer({ proposal, isOpen, onClose, onSuccess }: ProposalDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!isOpen || !proposal) return null

  const handleReview = async (status: ProposalStatus) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposal.id,
          status,
          rejectionReason: status === "REJECTED" ? rejectionReason : undefined
        }),
      })

      if (res.ok) {
        const label = status === "APPROVED" ? "approved" : status === "REJECTED" ? "rejected" : "put on hold"
        toast.success(`Proposal ${label} successfully`)
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to review proposal")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusConfig: Record<string, { color: string, bg: string }> = {
    PENDING: { color: "text-amber-700", bg: "bg-amber-100" },
    APPROVED: { color: "text-emerald-700", bg: "bg-emerald-100" },
    ON_HOLD: { color: "text-purple-700", bg: "bg-purple-100" },
    REJECTED: { color: "text-rose-700", bg: "bg-rose-100" },
  }

  const status = statusConfig[proposal.status] || { color: "text-slate-700", bg: "bg-slate-100" }

  const handleArchive = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/proposals/${proposal.id}/archive`, {
        method: "POST",
      })

      if (res.ok) {
        toast.success("Proposal archived successfully")
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to archive proposal")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Proposal Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{proposal.title}</h3>
              <div className="text-slate-500 text-sm">
                Submitted by <span className="font-semibold text-slate-700">{proposal.submittedBy.fullName}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
              {proposal.status}
            </span>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm text-slate-500">
                  <span className="material-symbols-outlined text-xl">corporate_fare</span>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Department</div>
                  <div className="text-sm font-bold text-slate-700">{proposal.department.name} ({proposal.department.code})</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Date</div>
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                  <span className="material-symbols-outlined text-lg text-slate-400">calendar_month</span>
                  {format(new Date(proposal.date), "MMM d, yyyy")}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Time</div>
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                  <span className="material-symbols-outlined text-lg text-slate-400">schedule</span>
                  {formatTimeString(proposal.startTime)} - {formatTimeString(proposal.endTime)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Venue</div>
              <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                <span className="material-symbols-outlined text-lg text-slate-400">location_on</span>
                {proposal.venue}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Description</div>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {proposal.description || "No description provided."}
              </p>
            </div>

            {proposal.status === "REJECTED" && proposal.rejectionReason && (
              <div>
                <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider mb-2">Rejection Reason</div>
                <p className="text-rose-700 text-sm leading-relaxed bg-rose-50 p-4 rounded-xl border border-rose-100">
                  {proposal.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        {proposal.status === "PENDING" && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            {showRejectForm ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Reason for rejection</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[80px] text-sm"
                  placeholder="Explain why this proposal is rejected..."
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRejectForm(false)}
                    className="flex-1 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleReview("REJECTED")}
                    disabled={isSubmitting || !rejectionReason.trim()}
                    className="flex-1 py-2 font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleReview("APPROVED")}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Approve
                </button>
                <button 
                  onClick={() => handleReview("ON_HOLD")}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined">pause_circle</span>
                  Hold
                </button>
                <button 
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-1 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-semibold text-sm disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined">cancel</span>
                  Reject
                </button>
              </div>
            )}
          </div>
        )}

        {proposal.status === "APPROVED" && (!proposal.event || proposal.event.status === "COMPLETED") && !proposal.isArchived && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button 
              onClick={handleArchive}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              <span className="material-symbols-outlined">archive</span>
              Archive Proposal
            </button>
            <p className="text-center text-xs text-slate-500 mt-3 font-medium">
              {proposal.event ? "This event is completed. " : "This is a legacy proposal with no active event. "}
              You can archive this proposal to hide it from the active views.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
