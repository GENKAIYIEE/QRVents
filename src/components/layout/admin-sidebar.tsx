"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { logoutAction } from "@/app/admin/actions"

const NAV_ITEMS = [
  {
    icon: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    description: "Overview & analytics",
  },
  {
    icon: "calendar_month",
    label: "Events",
    href: "/admin/events",
    description: "Create & manage events",
  },
  {
    icon: "assignment",
    label: "Event Proposals",
    href: "/admin/proposals",
    description: "Review dept proposals",
  },
  {
    icon: "qr_code_scanner",
    label: "Campus Scanner",
    href: "/admin/scanner",
    description: "QR attendance scanning",
  },
  {
    icon: "wifi_tethering",
    label: "Live Attendance",
    href: "/admin/attendance",
    description: "Real-time monitoring",
  },
  {
    icon: "manage_accounts",
    label: "Dept Admins",
    href: "/admin/dept-admins",
    description: "Register department deans",
  },
  {
    icon: "bar_chart",
    label: "Reports",
    href: "/admin/reports",
    description: "Generate & export reports",
  },
  {
    icon: "settings",
    label: "Settings",
    href: "/admin/settings",
    description: "System configuration",
  },
]

interface AdminSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()

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
              background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 15px rgba(59,130,246,0.4)",
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#fff", fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
            >
              qr_code_2
            </span>
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px", lineHeight: 1 }}>
              QRVents
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "11px", fontWeight: 700, marginTop: "3px", letterSpacing: "1px", opacity: 0.9 }}>
              SUPER ADMIN
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div
          style={{
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "10px",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "#fff", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
            >
              admin_panel_settings
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700 }}>System Administrator</div>
            <div style={{ color: "#BFDBFE", fontSize: "11px", marginTop: "1px" }}>admin@gmail.com</div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: "8px",
              height: "8px",
              background: "#22C55E",
              borderRadius: "50%",
              flexShrink: 0,
              boxShadow: "0 0 6px #22C55E",
            }}
          />
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
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
                    ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.15))"
                    : "transparent",
                  border: isActive ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
                  position: "relative",
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
                      background: "linear-gradient(180deg, #3B82F6, #1D4ED8)",
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    background: isActive
                      ? "linear-gradient(135deg, #3B82F6, #1D4ED8)"
                      : "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 200ms ease",
                    boxShadow: isActive ? "0 4px 12px rgba(59,130,246,0.35)" : "none",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: isActive ? "#fff" : "#BFDBFE",
                      fontSize: "18px",
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div style={{ minWidth: 0 }}>
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
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div
        style={{
          padding: "12px 10px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
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
              <span
                className="material-symbols-outlined"
                style={{ color: "#EF4444", fontSize: "18px" }}
              >
                logout
              </span>
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
