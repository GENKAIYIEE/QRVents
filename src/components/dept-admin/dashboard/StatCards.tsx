"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, CalendarDays, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function CountUp({ to }: { to: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number
    const duration = 1000 // 1 second

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      if (progress < duration) {
        setCount(Math.floor((progress / duration) * to))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(to)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [to])

  return <span>{count}</span>
}

export function StatCards({
  studentCount,
  pendingCount,
  approvedCount,
  upcomingCount,
  department,
}: {
  studentCount: number
  pendingCount: number
  approvedCount: number
  upcomingCount: number
  department: any
}) {
  const cards = [
    {
      title: "Total Students",
      value: studentCount,
      icon: Users,
      description: "Registered in dept",
    },
    {
      title: "Upcoming Events",
      value: upcomingCount,
      icon: CalendarDays,
      description: "School & dept events",
    },
    {
      title: "Pending Proposals",
      value: pendingCount,
      icon: Clock,
      description: "Awaiting approval",
    },
    {
      title: "Approved Proposals",
      value: approvedCount,
      icon: CheckCircle,
      description: "Ready for launch",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={idx}
            variants={item}
            className="group bg-white rounded-xl shadow-sm border border-slate-100 p-6 transition-all hover:-translate-y-1 hover:shadow-md relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: department.color }}
            />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                  <CountUp to={card.value} />
                </h3>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: department.lightBg }}
              >
                <Icon size={24} style={{ color: department.color }} />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium">{card.description}</p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
