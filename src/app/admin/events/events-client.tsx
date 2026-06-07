"use client"

import { useState, useEffect } from "react"
import { EventsTable } from "@/components/admin/events-table"
import { EventFormModal } from "@/components/admin/event-form-modal"
import { EventStatus } from "@prisma/client"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export function EventsClient({ departments }: { departments: any[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<any>(null)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState<string>(searchParams.get("status") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (search) query.set("search", search)
      if (status !== "ALL") query.set("status", status)

      const res = await fetch(`/api/admin/events?${query.toString()}`)
      const { data } = await res.json()
      
      setEvents(data.events || [])
      setTotalPages(data.pages || 1)

      // Update URL
      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch (err) {
      console.error("Failed to fetch events", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [page, search, status])

  const handleStatusChange = async (id: string, newStatus: EventStatus) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" })
      if (res.ok) fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  const openEditModal = (event: any) => {
    setEventToEdit(event)
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEventToEdit(null)
    setIsModalOpen(true)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
            <span className="text-slate-300 text-xs font-bold">/</span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Events</span>
          </div>
          <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#1E293B", letterSpacing: "-0.5px", margin: 0 }}>Events Management</h1>
        </div>
        
        <button 
          onClick={openCreateModal}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#2563EB", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)", border: "none", cursor: "pointer" }}
          className="hover:bg-blue-700 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create Event
        </button>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "16px", border: "1px solid #F1F5F9", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
        <div style={{ flex: "1 1 auto", position: "relative", minWidth: "250px" }}>
          <span className="material-symbols-outlined absolute text-slate-400" style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}>search</span>
          <input 
            type="text" 
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 48px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", outline: "none", fontSize: "15px" }}
            className="focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div style={{ width: "100%", maxWidth: "220px", flexShrink: 0 }}>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", outline: "none", fontWeight: 600, color: "#334155", fontSize: "15px", cursor: "pointer", appearance: "auto" }}
            className="focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
        </div>
      ) : (
        <>
          <EventsTable 
            events={events}
            onEdit={openEditModal}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Previous
              </button>
              <div className="px-4 py-2 font-medium text-slate-600">
                Page {page} of {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 font-medium text-slate-600 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <EventFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchEvents()
          }}
          departments={departments}
          eventToEdit={eventToEdit}
        />
      )}
    </div>
  )
}
