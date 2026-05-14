"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/admin/actions"
import { toast } from "sonner"
import { LayoutDashboard, QrCode, CalendarCheck, UserCircle, Settings, LogOut } from "lucide-react"

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/student/dashboard",
    description: "Overview & analytics",
    comingSoon: false,
  },
  {
    icon: QrCode,
    label: "My QR Code",
    href: "#",
    description: "Your permanent QR pass",
    comingSoon: true,
  },
  {
    icon: CalendarCheck,
    label: "Attendance History",
    href: "#",
    description: "Events you attended",
    comingSoon: true,
  },
  {
    icon: UserCircle,
    label: "Profile",
    href: "#",
    description: "Your student details",
    comingSoon: true,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "#",
    description: "Account configuration",
    comingSoon: true,
  },
]

interface StudentSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  session: any
  department: any
  studentUser: any
}

export function StudentSidebar({ mobileOpen, onMobileClose, session, department, studentUser }: StudentSidebarProps) {
  const pathname = usePathname()

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
    if (onMobileClose) onMobileClose()
  }

  const deptColor = department?.color || "#3B82F6"

  const SidebarContent = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "linear-gradient(180deg, #001A4D 0%, #00205B 50%, #001A4D 100%)",
        overflow: "hidden",
      }}
    >
      {/* Top logo area */}
      <div
        style={{
          padding: "28px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          {/* Logo mark */}
          <div
            style={{
              width: "42px",
              height: "42px",
              background: `linear-gradient(135deg, ${deptColor}, #1D4ED8)`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 15px ${deptColor}66`,
              flexShrink: 0,
            }}
          >
            <QrCode color="#fff" size={22} strokeWidth={2.5} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px", lineHeight: 1 }}>
              QRVents
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "11px", fontWeight: 700, marginTop: "3px", letterSpacing: "1px", opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              STUDENT PORTAL
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 10px",
          scrollbarWidth: "none",
        }}
      >
        <div style={{ marginBottom: "6px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href + "/"))
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={item.comingSoon ? handleComingSoon : onMobileClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  marginBottom: "2px",
                  textDecoration: "none",
                  transition: "all 200ms ease",
                  background: isActive
                    ? `linear-gradient(135deg, ${deptColor}33, ${deptColor}1a)`
                    : "transparent",
                  border: isActive ? `1px solid ${deptColor}4d` : "1px solid transparent",
                  position: "relative",
                  opacity: item.comingSoon ? 0.7 : 1,
                }}
                className={`sidebar-nav-link${isActive ? " sidebar-nav-active" : ""}`}
              >
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: "3px",
                      background: `linear-gradient(180deg, ${deptColor}, #1D4ED8)`,
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    background: isActive
                      ? `linear-gradient(135deg, ${deptColor}, #1D4ED8)`
                      : "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 200ms ease",
                    boxShadow: isActive ? `0 4px 12px ${deptColor}59` : "none",
                  }}
                >
                  <Icon 
                    size={18} 
                    color={isActive ? "#fff" : "#BFDBFE"} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      color: isActive ? "#FFFFFF" : "#E2E8F0",
                      fontSize: "13.5px",
                      fontWeight: isActive ? 700 : 600,
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      color: isActive ? "#FFFFFF" : "#93C5FD",
                      fontSize: "10.5px",
                      marginTop: "3px",
                      fontWeight: isActive ? 500 : 500,
                      opacity: isActive ? 0.9 : 0.8,
                    }}
                  >
                    {item.description}
                  </div>
                </div>
                {item.comingSoon && (
                  <div style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    color: "#94A3B8",
                    background: "rgba(255,255,255,0.1)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    textTransform: "uppercase"
                  }}>
                    Soon
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions & user info */}
      <div
        style={{
          padding: "12px 10px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* Student info */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "10px",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              background: deptColor,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              className="text-white font-bold text-sm"
            >
              {session?.fullName?.charAt(0) || "S"}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.fullName}</div>
            <div style={{ color: "#BFDBFE", fontSize: "11px", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {department?.code || "No Dept"} · {studentUser?.yearLevel || "N/A"}
            </div>
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 200ms ease",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)"
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                background: "rgba(239,68,68,0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LogOut size={18} color="#EF4444" />
            </div>
            <div>
              <div style={{ color: "#FECACA", fontSize: "13px", fontWeight: 700 }}>Sign Out</div>
              <div style={{ color: "#F87171", fontSize: "10.5px", marginTop: "2px", fontWeight: 500 }}>End your session</div>
            </div>
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: "260px",
          zIndex: 40,
        }}
        className="hidden md:block"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onMobileClose}
          />
          <aside
            style={{
              position: "relative",
              width: "260px",
              height: "100%",
              zIndex: 51,
              animation: "slide-in-right-from-left 0.25s ease",
            }}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
