"use client"

import { useState } from "react"
import { Wallet, HeartHandshake, X } from "lucide-react"

interface ChoosePenaltyTypeModalProps {
  penaltyId: string
  eventTitle: string
  feeAmount: number
  serviceHours: number
  isOpen: boolean
  onClose: () => void
  onChosen: () => void
}

export function ChoosePenaltyTypeModal({
  penaltyId,
  eventTitle,
  feeAmount,
  serviceHours,
  isOpen,
  onClose,
  onChosen,
}: ChoosePenaltyTypeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleChoose(type: "FEE" | "COMMUNITY_SERVICE") {
    setLoading(type)
    try {
      const res = await fetch(
        `/api/penalties/${penaltyId}/choose-type`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ type }),
        }
      )
      if (!res.ok) throw new Error("Failed to choose penalty type")
      onChosen()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-[#0F172A]">
            Choose Your Penalty
          </h3>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#475569]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#475569] mb-6">
          You missed{" "}
          <span className="font-semibold text-[#0F172A]">
            {eventTitle}
          </span>
          . Please select how you'd like to resolve this.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleChoose("FEE")}
            disabled={loading !== null}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-[#E2E8F0] hover:border-[#1A3A8F] hover:bg-blue-50 transition-colors disabled:opacity-60"
          >
            <Wallet className="w-6 h-6 text-[#1A3A8F]" />
            <span className="font-semibold text-[#0F172A] text-sm">
              Pay a Fee
            </span>
            <span className="text-lg font-bold text-[#1A3A8F]">
              ₱{feeAmount.toFixed(2)}
            </span>
          </button>

          <button
            onClick={() => handleChoose("COMMUNITY_SERVICE")}
            disabled={loading !== null}
            className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-[#E2E8F0] hover:border-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-60"
          >
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            <span className="font-semibold text-[#0F172A] text-sm">
              Community Service
            </span>
            <span className="text-lg font-bold text-emerald-600">
              {serviceHours} hrs
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
