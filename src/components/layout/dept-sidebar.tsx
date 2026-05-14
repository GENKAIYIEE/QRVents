"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAction } from "@/app/admin/actions"
import { toast } from "sonner"

const NAV_ITEMS = [
  {
    icon: "dashboard",
    label: "Dashboard",
    href: "/dept/dashboard",
    description: "Overview & analytics",
    comingSoon: false,
  },
  {
    icon: "calendar_month",
    label: "Event",
    href: "#",
    description: "Create & manage events",
    comingSoon: true,
  },
  {
    icon: "send",
    label: "Propose Event",
    href: "#",
    description: "Submit event proposals",
    comingSoon: true,
  },
  {
    icon: "qr_code_scanner",
    label: "Campus Scanner",
    href: "#",
    description: "QR attendance scanning",
    comingSoon: true,
  },
  {
    icon: "wifi_tethering",
    label: "Live Attendance",
    href: "#",
    description: "Real-time monitoring",
    comingSoon: true,
  },
  {
    icon: "bar_chart",
    label: "Reports",
    href: "#",
    description: "Generate & export reports",
    comingSoon: true,
  },
  {
    icon: "settings",
    label: "Settings",
    href: "#",
    description: "System configuration",
    comingSoon: true,
  },
]

interface DeptSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  session: any
  department: any
}

export function DeptSidebar({ mobileOpen, onMobileClose, session, department }: DeptSidebarProps) {
  const pathname = usePathname()

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
    if (onMobileClose) onMobileClose()
  }

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
              background: `linear-gradient(135deg, ${department?.color || "#3B82F6"}, #1D4ED8)`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 15px ${department?.color || "#3B82F6"}66`,
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
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.3px", lineHeight: 1 }}>
              QRVents
            </div>
            <div style={{ color: "#FFFFFF", fontSize: "11px", fontWeight: 700, marginTop: "3px", letterSpacing: "1px", opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {department?.code || "DEPT"} ADMIN
            </div>
          </div>
        </div>

        {/* Admin badge */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
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
              background: department?.color || "#3B82F6",
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
              {session?.fullName?.charAt(0) || "D"}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#FFFFFF", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session?.fullName}</div>
            <div style={{ color: "#BFDBFE", fontSize: "11px", marginTop: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{department?.name}</div>
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
            const isActive = pathname === item.href || (item.href !== "#" && pathname.startsWith(item.href + "/"))
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
                    ? `linear-gradient(135deg, ${department?.color}33, ${department?.color}1a)`
                    : "transparent",
                  border: isActive ? `1px solid ${department?.color}4d` : "1px solid transparent",
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
                      background: `linear-gradient(180deg, ${department?.color || "#3B82F6"}, #1D4ED8)`,
                      borderRadius: "0 3px 3px 0",
                    }}
                  />
                )}
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    background: isActive
                      ? `linear-gradient(135deg, ${department?.color || "#3B82F6"}, #1D4ED8)`
                      : "rgba(255,255,255,0.05)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 200ms ease",
                    boxShadow: isActive ? `0 4px 12px ${department?.color || "#3B82F6"}59` : "none",
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
