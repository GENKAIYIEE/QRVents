"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0F4FF" }}>
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area — offset by sidebar width on md+ */}
      <div className="admin-main-wrapper">
        {/* Top Navbar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: "rgba(255,255,255,0.95)", // Slightly whiter for better contrast
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
            padding: "0 32px",
            height: "80px", // Increased height for more breathing room
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
            onClick={() => setMobileOpen(true)}
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
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              menu
            </span>
          </button>

          {/* Page breadcrumb / title area */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#3B82F6" }}>
                verified_user
              </span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px" }}>
                Super Admin Portal
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.5px" }}>
                Dashboard Overview
              </h1>
              {/* Live Monitoring indicator removed */}
            </div>
          </div>

          {/* Right side actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            {/* Notification bell */}
            <button
              style={{
                width: "44px",
                height: "44px",
                background: "white",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 200ms ease",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "#64748B", fontSize: "22px" }}
              >
                notifications
              </span>
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "9px",
                  height: "9px",
                  background: "#EF4444",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </button>

            {/* Admin avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "4px 4px 4px 16px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                cursor: "pointer",
              }}
            >
              <div style={{ textAlign: "right" }} className="hidden sm:block">
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F172A" }}>Admin</div>
                <div style={{ fontSize: "10px", color: "#64748B" }}>Super User</div>
              </div>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#fff", fontSize: "18px", fontVariationSettings: "'FILL' 1" }}
                >
                  admin_panel_settings
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-container">
          {children}
        </main>
      </div>
    </div>
  )
}
