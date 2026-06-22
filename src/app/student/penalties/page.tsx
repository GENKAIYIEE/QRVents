"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Calendar, Clock } from "lucide-react"
import { PenaltyStatusBadge } from "@/components/penalties/penalty-status-badge"
import { ChoosePenaltyTypeModal } from "@/components/penalties/choose-penalty-type-modal"

export default function StudentPenaltiesPage() {
  const [penalties, setPenalties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPenalty, setSelectedPenalty] = useState<any | null>(null)

  async function loadPenalties() {
    setLoading(true)
    const res = await fetch("/api/penalties")
    const data = await res.json()
    setPenalties(data.penalties || [])
    setLoading(false)
  }

  useEffect(() => {
    loadPenalties()
  }, [])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 text-[#94A3B8] text-sm">
        Loading your penalties...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-1">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-bold text-[#0F172A]">
          My Penalties
        </h1>
      </div>
      <p className="text-sm text-[#64748B] mb-6">
        Mandatory events you missed and how to resolve them
      </p>

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

            <div className="flex items-center gap-4 text-sm text-[#475569] mb-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#94A3B8]" />
                Deadline:{" "}
                <span className="font-medium">
                  {new Date(p.deadline).toLocaleDateString()}
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
                    ? `Pay ₱${p.feeAmount}`
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
