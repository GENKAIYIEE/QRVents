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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 group"
          >
            {/* Subtle gradient blob */}
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-30 transition-transform group-hover:scale-110"
              style={{ background: card.bg }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: card.bg }}
              >
                <Icon color={card.color} size={24} strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative z-10">
              <div className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
                <CountUp to={card.value} />
              </div>
              <div className="text-[13px] text-slate-500 font-bold mt-2 uppercase tracking-wider">
                {card.label}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
