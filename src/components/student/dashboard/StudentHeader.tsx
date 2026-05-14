"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Menu } from "lucide-react"

interface StudentHeaderProps {
  session: any
  department: any
  studentUser: any
  onMenuClick: () => void
}

export function StudentHeader({ session, department, studentUser, onMenuClick }: StudentHeaderProps) {
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const deptColor = department?.color || "#3B82F6"
  const deptLightBg = department?.lightBg || "#EFF6FF"

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(59,130,246,0.1)",
        padding: "0 32px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      {/* Mobile hamburger */}
      <button
        className="md:hidden"
        onClick={onMenuClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px",
          borderRadius: "10px",
          color: "#1E3A8A",
          backgroundColor: "#EFF6FF",
        }}
      >
        <Menu size={24} />
      </button>

      {/* Page breadcrumb / title area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
            Dashboard
          </h1>
        </div>
        <div style={{ fontSize: "13px", fontWeight: 500, color: "#64748B", marginTop: "4px" }}>
          Welcome back, {session?.fullName}! Here are your upcoming events.
        </div>
      </div>

      {/* Right side actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
        {/* Live clock */}
        <div className="hidden sm:block" style={{ fontSize: "13px", fontWeight: 600, color: "#475569" }}>
          {mounted ? format(time, "EEEE, MMMM d, yyyy · h:mm:ss a") : "Loading clock..."}
        </div>

        {/* Dept Badge */}
        <div
          style={{
            padding: "6px 12px",
            background: deptLightBg,
            color: deptColor,
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: deptColor }} />
          {department?.code || "No Dept"} · {studentUser?.yearLevel || "N/A"}
        </div>
      </div>
    </header>
  )
}
