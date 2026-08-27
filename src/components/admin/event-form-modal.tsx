"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventSchema, EventFormValues } from "@/lib/validations/event"
import { EventType } from "@prisma/client"
import { toast } from "sonner"



interface EventFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  departments: { id: string; name: string; code: string }[]
  eventToEdit?: any
}

export function EventFormModal({ isOpen, onClose, onSuccess, departments, eventToEdit }: EventFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!eventToEdit

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      date: eventToEdit ? new Date(eventToEdit.date).toISOString().split('T')[0] : "",
      startTime: eventToEdit?.startTime || "",
      endTime: eventToEdit?.endTime || "",
      venue: eventToEdit?.venue || "",
      eventType: eventToEdit?.eventType || "SCHOOL_WIDE",
      departmentId: eventToEdit?.departmentId || "",
      expectedAttendees: eventToEdit?.expectedAttendees || undefined,
      isMandatory: eventToEdit?.isMandatory || false,
      hasCertificate: eventToEdit?.hasCertificate || false,
    }
  })

  const eventType = watch("eventType")

  if (!isOpen) return null

  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const url = isEditing ? `/api/admin/events/${eventToEdit.id}` : "/api/admin/events"
      const method = isEditing ? "PATCH" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || "Something went wrong")
      }
      
      toast.success(isEditing ? "Event successfully updated!" : "Event successfully created!")
      reset()
      onSuccess()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || "Failed to save event")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50" style={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "42rem", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#1E293B", margin: 0 }}>
            {isEditing ? "Edit Event" : "Create New Event"}
          </h2>
          <button onClick={onClose} style={{ padding: "8px", borderRadius: "8px", color: "#64748B", backgroundColor: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:bg-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div style={{ padding: "24px", overflowY: "auto", flex: "1 1 0%" }}>
          {error && (
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#FEF2F2", color: "#DC2626", borderRadius: "8px", border: "1px solid #FEE2E2", fontSize: "14px", fontWeight: 500 }}>
              {error}
            </div>
          )}
          
          <form id="event-form" onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Title</label>
              <input 
                {...register("title")} 
                style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                className="focus:ring-2 focus:ring-blue-500"
                placeholder="E.g. Intramurals 2026"
              />
              {errors.title && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{errors.title.message}</p>}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Description (Optional)</label>
              <textarea 
                {...register("description")} 
                style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", minHeight: "80px", fontSize: "15px", resize: "vertical" }}
                className="focus:ring-2 focus:ring-blue-500"
                placeholder="Brief details about the event..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Date</label>
                <input 
                  type="date"
                  {...register("date")} 
                  style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                  className="focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{errors.date.message}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Venue</label>
                <input 
                  {...register("venue")} 
                  style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "15px" }}
                  className="focus:ring-2 focus:ring-blue-500"
                  placeholder="E.g. Main Gymnasium"
                />
                {errors.venue && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{errors.venue.message}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>Start Time</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="time"
                    {...register("startTime")} 
                    style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
                    className="focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 cursor-pointer"
                  />
                </div>
                {errors.startTime && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{errors.startTime.message}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>End Time</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="time"
                    {...register("endTime")} 
                    style={{ width: "100%", padding: "10px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "8px", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
                    className="focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 cursor-pointer"
                  />
                </div>
                {errors.endTime && <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{errors.endTime.message}</p>}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <input 
                type="checkbox" 
                id="isMandatory" 
                {...register("isMandatory")} 
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563EB" }}
              />
              <label htmlFor="isMandatory" style={{ fontSize: "14px", fontWeight: 600, color: "#334155", cursor: "pointer", userSelect: "none" }}>
                Mandatory Event (Penalties will be applied for absences)
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <input 
                type="checkbox" 
                id="hasCertificate" 
                {...register("hasCertificate")} 
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2563EB" }}
              />
              <label htmlFor="hasCertificate" style={{ fontSize: "14px", fontWeight: 600, color: "#334155", cursor: "pointer", userSelect: "none" }}>
                With Certificate (Provide certificates for completion)
              </label>
            </div>


          </form>
        </div>
        
        <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: "12px", backgroundColor: "#F8FAFC" }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ padding: "10px 24px", fontWeight: 600, color: "#475569", backgroundColor: "white", border: "1px solid #E2E8F0", borderRadius: "12px", cursor: "pointer" }}
            className="hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="event-form"
            disabled={isSubmitting}
            style={{ padding: "10px 24px", fontWeight: 600, color: "white", backgroundColor: "#2563EB", borderRadius: "12px", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1, display: "flex", alignItems: "center", gap: "8px" }}
            className="hover:bg-blue-700 transition-colors"
          >
            {isSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isEditing ? "Save Changes" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  )
}

