"use client"

import { useState } from "react"
import { CheckCircle, ShieldOff, X } from "lucide-react"

interface ResolvePenaltyModalProps {
  penaltyId: string
  studentName: string
  isOpen: boolean
  onClose: () => void
  onResolved: () => void
}

export function ResolvePenaltyModal({
  penaltyId,
  studentName,
  isOpen,
  onClose,
  onResolved,
}: ResolvePenaltyModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleAction(action: "resolve" | "waive") {
    setLoading(action)
    try {
      const res = await fetch(
        `/api/penalties/${penaltyId}`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ action }),
        }
      )
      if (!res.ok) throw new Error("Failed to update penalty")
      onResolved()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#0F172A]">
            Manage Penalty
          </h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#475569] mb-6">
          Choose an action for{" "}
          <span className="font-semibold text-[#0F172A]">
            {studentName}
          </span>'s penalty.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleAction("resolve")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            <CheckCircle className="w-4 h-4" />
            {loading === "resolve" ? "Resolving..." : "Mark as Resolved"}
          </button>

          <button
            onClick={() => handleAction("waive")}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 h-11 rounded-xl border border-[#E2E8F0] text-[#475569] font-medium text-sm hover:bg-[#F8FAFC] transition-colors disabled:opacity-60"
          >
            <ShieldOff className="w-4 h-4" />
            {loading === "waive" ? "Waiving..." : "Waive Penalty"}
          </button>

          <button
            onClick={onClose}
            className="text-sm text-[#94A3B8] hover:text-[#475569] mt-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
