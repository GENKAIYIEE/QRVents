"use client"

import { useState, useEffect } from "react"
import { AlertTriangle } from "lucide-react"

interface CreateEventFormProps {
  onSuccess?: () => void
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [venue, setVenue] = useState("")
  const [isMandatory, setIsMandatory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [penaltySettings, setPenaltySettings] = useState({
    defaultFee: 0,
    defaultServiceHours: 0,
  })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/penalty-settings")
        const data = await res.json()
        if (data.settings) {
          setPenaltySettings({
            defaultFee: data.settings.defaultFee,
            defaultServiceHours: data.settings.defaultServiceHours,
          })
        }
      } catch (err) {
        console.error("Failed to load penalty settings")
      }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const payload = {
        title,
        description,
        date: new Date(date).toISOString(),
        startTime,
        endTime,
        venue,
        eventType: "DEPARTMENT",
        isMandatory,
        expectedAttendees: 0
      }

      const res = await fetch("/api/dept/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit event proposal")
      }

      setSuccessMsg("Event proposal submitted!")
      setTitle("")
      setDescription("")
      setDate("")
      setStartTime("")
      setEndTime("")
      setVenue("")
      setIsMandatory(false)

      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full h-11 px-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] text-sm outline-none focus:border-[#1A3A8F] focus:bg-white transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">Event Title*</label>
        <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. College Foundation Day 2025" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">Description</label>
        <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the event..." className={inputClass + " h-auto py-3"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Date*</label>
          <input required type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Start Time*</label>
          <input required type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">End Time*</label>
          <input required type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">Venue*</label>
        <input required value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. PCLaUnion Gymnasium" className={inputClass} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-[13px] font-medium text-[#0F172A]">Mandatory Attendance</p>
            <p className="text-[12px] text-[#64748B]">Students who miss this event will receive an attendance penalty</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMandatory(!isMandatory)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${isMandatory ? 'bg-[#1A3A8F]' : 'bg-[#E2E8F0]'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-200 ${isMandatory ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
          </button>
        </div>
        
        {isMandatory && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
            <AlertTriangle className="w-3 h-3" />
            Students who miss this event will receive a penalty of ₱{penaltySettings.defaultFee} or {penaltySettings.defaultServiceHours} hours of community service
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {successMsg && <p className="text-emerald-600 text-sm mt-2">{successMsg}</p>}

      <button disabled={loading} type="submit" className="w-full h-12 bg-[#1A3A8F] hover:bg-[#15307A] text-white font-medium rounded-xl transition-all disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Event Proposal"}
      </button>
    </form>
  )
}
