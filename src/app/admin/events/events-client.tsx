"use client"

import { useState, useEffect } from "react"
import { EventsTable } from "@/components/admin/events-table"
import { EventFormModal } from "@/components/admin/event-form-modal"
import { CompleteEventModal } from "@/components/admin/complete-event-modal"
import { EventStatus, EventType } from "@prisma/client"
import { toast } from "sonner"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export function EventsClient({ departments, isArchived = false }: { departments: any[], isArchived?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<any>(null)
  const [eventToComplete, setEventToComplete] = useState<any | null>(null)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [status, setStatus] = useState<string>(searchParams.get("status") || "ALL")
  const [eventType, setEventType] = useState<string>(searchParams.get("eventType") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (search) query.set("search", search)
      if (status !== "ALL") query.set("status", status)
      if (eventType !== "ALL") query.set("eventType", eventType)
      query.set("isArchived", isArchived.toString())

      const res = await fetch(`/api/admin/events?${query.toString()}`)
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = await res.json()
      const data = json.data

      setEvents(data?.events || [])
      setTotalPages(data?.pages || 1)

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
  }, [page, search, status, eventType])

  const handleStatusChange = async (id: string, newStatus: EventStatus) => {
    if (newStatus === "COMPLETED") {
      const evt = events.find(e => e.id === id)
      if (evt) setEventToComplete(evt)
      return
    }

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

  const handleCompleteConfirmed = () => {
    toast.success("Event completed successfully! Penalties have been processed.")
    fetchEvents()
    setEventToComplete(null)
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
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      
      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <Link 
          href="/admin/events"
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            !isArchived 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Active Events
        </Link>
        <Link 
          href="/admin/events/archived"
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            isArchived 
              ? "border-blue-600 text-blue-600" 
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Archived Events
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex-1 w-full relative min-w-[250px] lg:max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 [font-variation-settings:'FILL'_1]">search</span>
          <input 
            type="text" 
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pr-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          <select 
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full sm:w-[180px] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="ALL">All Classifications</option>
            <option value="SCHOOL_WIDE">School-Wide</option>
            <option value="DEPARTMENT">Department</option>
          </select>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full sm:w-[180px] py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button 
            onClick={openCreateModal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1]">add</span>
            Create Event
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 [font-variation-settings:'FILL'_1]">progress_activity</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <EventsTable 
            events={events}
            onEdit={openEditModal}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onGeneratePenalties={setEventToComplete}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Prev
              </button>
              <div className="px-4 py-2 font-bold text-slate-500 text-sm bg-white border border-slate-100 rounded-lg shadow-sm">
                {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
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

      {eventToComplete && (
        <CompleteEventModal
          eventId={eventToComplete.id}
          eventTitle={eventToComplete.title}
          isOpen={!!eventToComplete}
          onClose={() => setEventToComplete(null)}
          onConfirmed={handleCompleteConfirmed}
        />
      )}
    </div>
  )
}
