"use client"

import { motion } from "framer-motion"
import { format, isToday } from "date-fns"
import { MapPin, QrCode, Calendar } from "lucide-react"

interface UpcomingEventsListProps {
  events: any[]
  department: any
}

export function UpcomingEventsList({ events, department }: UpcomingEventsListProps) {
  if (events.length === 0) {
    return (
      <div style={{ height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8", textAlign: "center", padding: "0 20px" }}>
        <Calendar size={32} style={{ marginBottom: "12px" }} color="#CBD5E1" />
        <div style={{ fontSize: "14px", fontWeight: 600 }}>No upcoming events at the moment.</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>Check back soon!</div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {events.map((event, idx) => {
        const isSchoolWide = event.eventType === "SCHOOL_WIDE"
        const eventDate = new Date(event.date)
        const isEventToday = isToday(eventDate)
        
        let statusBadge = { label: "Upcoming", color: "#64748B", bg: "#F1F5F9" }
        if (isEventToday) {
          statusBadge = { label: "Today", color: "#059669", bg: "#D1FAE5" }
        } else if (event.status === "ONGOING") {
          statusBadge = { label: "Ongoing", color: "#D97706", bg: "#FEF3C7" }
        }

        const typeBadge = isSchoolWide 
          ? { label: "School-Wide", color: "#1D4ED8", bg: "#DBEAFE" } 
          : { label: event.department?.code || "Department", color: department?.color || "#3B82F6", bg: department?.lightBg || "#EFF6FF" }

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            whileHover={{ y: -4 }}
            style={{
              padding: "16px",
              borderRadius: "14px",
              background: "#FFFFFF",
              border: "1px solid #F1F5F9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 15px rgba(0,0,0,0.02)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              transition: "transform 200ms ease, box-shadow 200ms ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{event.title}</div>
              <div style={{ 
                fontSize: "10px", 
                fontWeight: 700, 
                background: statusBadge.bg, 
                color: statusBadge.color, 
                padding: "3px 8px", 
                borderRadius: "10px", 
                textTransform: "uppercase",
                flexShrink: 0
              }}>
                {statusBadge.label}
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ 
                fontSize: "10px", 
                fontWeight: 700, 
                background: typeBadge.bg, 
                color: typeBadge.color, 
                padding: "2px 8px", 
                borderRadius: "6px",
              }}>
                {typeBadge.label}
              </div>
              <div style={{ 
                fontSize: "10px", 
                fontWeight: 600, 
                background: "#F8FAFC", 
                color: "#64748B", 
                border: "1px solid #E2E8F0",
                padding: "2px 8px", 
                borderRadius: "6px",
              }}>
                {event.department?.name || "School-Wide"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                <Calendar size={14} />
                <span style={{ fontSize: "12px", fontWeight: 500 }}>
                  {format(eventDate, "MMMM d, yyyy")} · {event.startTime}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
                <MapPin size={14} />
                <span style={{ fontSize: "12px", fontWeight: 500 }}>{event.venue}</span>
              </div>
            </div>

            <div style={{ 
              marginTop: "auto", 
              paddingTop: "12px", 
              borderTop: "1px dashed #E2E8F0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748B"
            }}>
              <QrCode size={14} />
              <span style={{ fontSize: "11px", fontWeight: 500 }}>Scan your QR code at the venue to check in</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
