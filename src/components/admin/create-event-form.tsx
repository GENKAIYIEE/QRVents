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
  const [eventType, setEventType] = useState("SCHOOL_WIDE")
  const [departmentId, setDepartmentId] = useState("")
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
      const payload: any = {
        title,
        description,
        date: new Date(date).toISOString(),
        startTime,
        endTime,
        venue,
        eventType,
        isMandatory,
        expectedAttendees: 0
      }

      if (eventType === "DEPARTMENT") {
        if (!departmentId) {
          throw new Error("Please select a department")
        }
        payload.departmentId = departmentId
      }

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create event")
      }

      setSuccessMsg("Event created!")
      setTitle("")
      setDescription("")
      setDate("")
      setStartTime("")
      setEndTime("")
      setVenue("")
      setEventType("SCHOOL_WIDE")
      setDepartmentId("")
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

      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-2">Event Type*</label>
        <select required value={eventType} onChange={e => setEventType(e.target.value)} className={inputClass}>
          <option value="SCHOOL_WIDE">School-Wide — All Students</option>
          <option value="DEPARTMENT">Department — Specific Dept</option>
        </select>
      </div>

      {eventType === "DEPARTMENT" && (
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-2">Department*</label>
          <select required value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputClass}>
            <option value="">Select Department</option>
            {/* Hardcoded or from API, assuming admin knows IDs or these are mapped */}
            <option value="bsit-id">BSIT</option>
            <option value="bshm-id">BSHM</option>
            <option value="bstm-id">BSTM</option>
            <option value="bscrim-id">BSCrim</option>
            <option value="bsed-id">BSEd</option>
            <option value="bsba-id">BSBA</option>
            <option value="bsmt-id">BSMT</option>
          </select>
        </div>
      )}

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
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  )
}

export function PenaltySettingsSection() {
  const [settings, setSettings] = useState({
    defaultDeadlineDays: 7,
    defaultFee: 100,
    defaultServiceHours: 2,
    overdueFeeIncrease: 50,
    overdueHoursIncrease: 1,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/penalty-settings")
        const data = await res.json()
        if (data.settings) setSettings(data.settings)
      } catch (err) {
        console.error("Failed to load settings")
      }
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: Number(e.target.value) })
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch("/api/penalty-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save settings")
      setSuccess("Settings saved successfully")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full h-11 px-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl text-[#0F172A] text-sm outline-none focus:border-[#1A3A8F] focus:bg-white transition-all"

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm mt-8">
      <div className="mb-6">
        <h3 className="text-[15px] font-semibold text-[#0F172A]">Attendance Penalty Settings</h3>
        <p className="text-[13px] text-[#64748B]">Configure default values for all attendance penalties system-wide. These values apply to all newly created penalties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Default Deadline (days)</label>
          <input type="number" min="1" name="defaultDeadlineDays" value={settings.defaultDeadlineDays} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-[#94A3B8] mt-1">Days a student has to resolve a penalty</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Default Fee Amount (₱)</label>
          <input type="number" min="0" name="defaultFee" value={settings.defaultFee} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-[#94A3B8] mt-1">Fee charged for missing a mandatory event</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Community Service Hours</label>
          <input type="number" min="1" name="defaultServiceHours" value={settings.defaultServiceHours} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-[#94A3B8] mt-1">Hours of service for students who choose community service</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Overdue Fee Increase (₱)</label>
          <input type="number" min="0" name="overdueFeeIncrease" value={settings.overdueFeeIncrease} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-[#94A3B8] mt-1">Added to the fee once when the deadline passes</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F172A] mb-1">Overdue Service Hours Increase</label>
          <input type="number" min="0" name="overdueHoursIncrease" value={settings.overdueHoursIncrease} onChange={handleChange} className={inputClass} />
          <p className="text-xs text-[#94A3B8] mt-1">Added to service hours once when deadline passes</p>
        </div>
      </div>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-6">
        <h4 className="text-[12px] font-medium text-[#94A3B8] mb-3">Preview — What a student will see</h4>
        <div className="flex flex-col gap-2 text-sm text-[#475569]">
          <div className="flex justify-between">
            <span className="font-semibold text-[#0F172A]">On time:</span>
            <span>Fee option: ₱{settings.defaultFee} | Service option: {settings.defaultServiceHours} hours</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-red-600">After deadline:</span>
            <span>Fee option: ₱{settings.defaultFee + settings.overdueFeeIncrease} | Service option: {settings.defaultServiceHours + settings.overdueHoursIncrease} hours</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-emerald-600 text-sm mb-4">{success}</p>}

      <div className="flex justify-end">
        <button disabled={loading} onClick={handleSave} className="w-full md:w-auto h-11 px-6 bg-[#1A3A8F] hover:bg-[#15307A] text-white font-medium rounded-xl transition-all disabled:opacity-50">
          {loading ? "Saving..." : "Save Penalty Settings"}
        </button>
      </div>
    </div>
  )
}
