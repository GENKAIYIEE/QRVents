"use client"

import { useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { formatTimeString } from "@/lib/utils"

interface ArchiveDrawerProps {
  proposal: any | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ArchiveDrawer({ proposal, isOpen, onClose, onSuccess }: ArchiveDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!isOpen || !proposal) return null

  const handleRestore = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/archives/${proposal.id}/restore`, {
        method: "POST",
      })

      if (res.ok) {
        toast.success("Proposal restored to active list")
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to restore proposal")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/archives/${proposal.id}/delete`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Archive permanently deleted")
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to delete archive")
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">inventory_2</span>
            <h2 className="text-xl font-bold text-slate-800">Archived Record</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{proposal.title}</h3>
              <div className="text-slate-500 text-sm">
                Submitted by <span className="font-semibold text-slate-700">{proposal.submittedBy?.fullName || "Unknown"}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
              ARCHIVED
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
                  <div className="text-sm font-bold text-slate-700">{proposal.department?.name} ({proposal.department?.code})</div>
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
            
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Archive Information</div>
              <div className="text-sm font-medium text-slate-600">
                Archived on {format(new Date(proposal.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          {showDeleteConfirm ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                <h4 className="text-sm font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  Permanent Deletion
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed font-medium">
                  This action cannot be undone. This proposal will be permanently removed from the database.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-2 font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50 shadow-sm shadow-rose-600/20 transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleRestore}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-50 transition-colors shadow-sm shadow-blue-600/20"
              >
                <span className="material-symbols-outlined text-[18px]">unarchive</span>
                Restore Proposal
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 font-bold text-sm disabled:opacity-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Delete Permanently
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
