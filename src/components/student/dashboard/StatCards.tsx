"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CalendarDays, CalendarCheck, Award } from "lucide-react"

function CountUp({ to }: { to: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = to
    if (start === end) {
      setCount(end)
      return
    }
    const totalDuration = 1000 // 1 second
    const incrementTime = 20
    const step = Math.max(1, Math.floor((end - start) / (totalDuration / incrementTime)))

    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)

    return () => clearInterval(timer)
  }, [to])

  return <>{count}</>
}

interface StatCardsProps {
  data: {
    upcomingEventsCount: number
    eventsAttendedCount: number
    departmentsVisitedCount: number
    department: any
  }
}

export function StatCards({ data }: StatCardsProps) {
  const deptColor = data.department?.color || "#3B82F6"
  const deptBg = data.department?.lightBg || "#EFF6FF"

  const cards = [
    {
      id: "upcoming",
      icon: CalendarDays,
      label: "Upcoming Events",
      value: data.upcomingEventsCount,
      color: deptColor,
      bg: deptBg,
    },
    {
      id: "attended",
      icon: CalendarCheck,
      label: "Events Attended",
      value: data.eventsAttendedCount,
      color: deptColor,
      bg: deptBg,
    },
    {
      id: "visited",
      icon: Award,
      label: "Departments Visited",
      value: data.departmentsVisitedCount,
      color: deptColor,
      bg: deptBg,
    },
  ]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "22px 24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)",
              border: "1px solid #F1F5F9",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle gradient blob */}
            <div
              style={{
                position: "absolute",
                top: "-30px",
                right: "-30px",
                width: "120px",
                height: "120px",
                background: card.bg,
                borderRadius: "50%",
                opacity: 0.3,
              }}
            />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  background: card.bg,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon color={card.color} size={22} strokeWidth={2.5} />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#0F172A",
                  lineHeight: 1,
                  letterSpacing: "-1px",
                }}
              >
                <CountUp to={card.value} />
              </div>
              <div style={{ color: "#64748B", fontSize: "13px", fontWeight: 500, marginTop: "6px" }}>
                {card.label}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
