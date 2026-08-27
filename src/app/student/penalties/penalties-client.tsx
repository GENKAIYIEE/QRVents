"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"
import { TableSkeleton } from "@/components/ui/skeleton"
import { PenaltyStatusBadge } from "@/components/penalties/penalty-status-badge"
import { ChoosePenaltyTypeModal } from "@/components/penalties/choose-penalty-type-modal"

export function PenaltiesClient() {
  const [penalties, setPenalties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPenalty, setSelectedPenalty] = useState<any | null>(null)

  async function loadPenalties() {
    try {
      setLoading(true)
      const res = await fetch("/api/penalties")
      if (!res.ok) {
        throw new Error("Failed to fetch penalties")
      }
      const data = await res.json()
      setPenalties(data.penalties || [])
    } catch (error) {
      console.error(error)
      toast.error("Failed to load penalties")
      setPenalties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPenalties()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <TableSkeleton columns={3} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">

      {penalties.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          <p className="text-emerald-700 font-medium">
            You have no penalties. Great job!
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {penalties.map((p) => (
          <div key={p.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#0F172A]">
                  {p.event.title}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(p.event.date).toLocaleDateString()}
                </p>
              </div>
              <PenaltyStatusBadge status={p.status} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569] mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                Deadline:{" "}
                <span className="font-medium">
                  {new Date(p.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Reason:{" "}
                <span className="font-medium text-rose-600">
                  {p.reason === "ABSENT" || !p.reason
                    ? "Absent (Missed mandatory event)"
                    : p.reason === "LATE"
                    ? "Late check-in (Arrived >30 mins late)"
                    : p.reason === "NO_CHECKOUT"
                    ? "Did not check out"
                    : p.reason === "LATE_AND_NO_CHECKOUT"
                    ? "Late check-in & did not check out"
                    : p.reason.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {p.type && (
              <div className="bg-[#F8FAFC] rounded-lg p-3 mb-3">
                <p className="text-xs text-[#94A3B8] mb-1">
                  Your chosen resolution
                </p>
                <p className="font-semibold text-[#0F172A]">
                  {p.type === "FEE" 
                    ? `Pay ₱${Number(p.feeAmount || 0).toFixed(2)}`
                    : `${p.serviceHours} hours of community service`}
                </p>
              </div>
            )}

            {!p.type && (p.status === "PENDING" || p.status === "OVERDUE") && (
              <button
                onClick={() => setSelectedPenalty(p)}
                className="w-full h-10 rounded-lg bg-[#1A3A8F] text-white text-sm font-semibold hover:bg-[#15307A] transition-colors"
              >
                Choose Resolution
              </button>
            )}

            {(p.status === "RESOLVED" || p.status === "WAIVED") && (
              <p className="text-xs text-[#94A3B8]">
                {p.status === "RESOLVED" 
                  ? "This penalty has been resolved." 
                  : "This penalty has been waived."}
              </p>
            )}
          </div>
        ))}
      </div>

      {selectedPenalty && (
        <ChoosePenaltyTypeModal
          penaltyId={selectedPenalty.id}
          eventTitle={selectedPenalty.event.title}
          feeAmount={selectedPenalty.feeAmount}
          serviceHours={selectedPenalty.serviceHours}
          isOpen={!!selectedPenalty}
          onClose={() => setSelectedPenalty(null)}
          onChosen={loadPenalties}
        />
      )}
    </div>
  )
}
