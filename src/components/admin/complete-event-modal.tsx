"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"

interface CompleteEventModalProps {
  eventId: string
  eventTitle: string
  isOpen: boolean
  onClose: () => void
  onConfirmed: () => void
}

export function CompleteEventModal({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onConfirmed,
}: CompleteEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<{
    isMandatory: boolean
    missingCount: number
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    fetch(`/api/events/${eventId}/status`)
      .then((res) => res.json())
      .then((data) => setPreview(data))
      .finally(() => setLoading(false))
  }, [isOpen, eventId])

  if (!isOpen) return null

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/events/${eventId}/status`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ 
            status: "COMPLETED" 
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to update event")
      }

      onConfirmed()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Mark Event as Completed?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#475569]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[#475569] mb-4">
          You are about to mark{" "}
          <span className="font-semibold text-[#0F172A]">
            {eventTitle}
          </span>{" "}
          as completed.
        </p>

        {loading && (
          <div className="text-sm text-[#94A3B8] py-3">
            Checking attendance data...
          </div>
        )}

        {!loading && preview && preview.isMandatory && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800">
              This is a{" "}
              <strong>mandatory</strong>{" "}
              event.{" "}
              <strong>
                {preview.missingCount}
              </strong>{" "}
              student
              {preview.missingCount !== 1 ? "s" : ""} did not 
              attend and will receive 
              an attendance penalty.
            </p>
          </div>
        )}

        {!loading && preview && !preview.isMandatory && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-800">
              This event is not mandatory — no penalties will be generated.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 h-11 rounded-xl border border-[#E2E8F0] text-[#475569] font-medium text-sm hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || loading}
            className="flex-1 h-11 rounded-xl bg-[#1A3A8F] text-white font-medium text-sm hover:bg-[#15307A] transition-colors disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}
