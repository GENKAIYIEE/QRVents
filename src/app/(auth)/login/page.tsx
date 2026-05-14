import type { Metadata } from "next"
import Link from "next/link"
import LoginForm from "@/components/auth/LoginForm"

export const metadata: Metadata = {
  title: "Access Portal — QRVents",
  description:
    "Secure login portal for QRVents — the precision event management and QR-based attendance tracking system of Polytechnic College of La Union.",
}

export default function LoginPage() {
  return (
    <main
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <section
        style={{
          width: "45%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "20px",
              flexShrink: 0,
              backgroundColor: "#00205B",
              color: "#ffffff",
            }}
          >
            QR
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: "20px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0b1c30",
                margin: 0,
              }}
            >
              QRVENTS
            </p>
            <p
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                fontWeight: 500,
                textTransform: "uppercase",
                marginTop: "4px",
                color: "#00205B",
                margin: "4px 0 0 0",
              }}
            >
              PRECISION EVENT MANAGEMENT
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "64px 0",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "280px",
              height: "280px",
              transition: "transform 700ms ease",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#e5eeff",
              }}
            >
              <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
                {/* QR finder patterns */}
                <rect x="10" y="10" width="60" height="60" rx="6" fill="none" stroke="#00205B" strokeWidth="8" />
                <rect x="26" y="26" width="28" height="28" rx="2" fill="#00205B" />
                <rect x="130" y="10" width="60" height="60" rx="6" fill="none" stroke="#00205B" strokeWidth="8" />
                <rect x="146" y="26" width="28" height="28" rx="2" fill="#00205B" />
                <rect x="10" y="130" width="60" height="60" rx="6" fill="none" stroke="#00205B" strokeWidth="8" />
                <rect x="26" y="146" width="28" height="28" rx="2" fill="#00205B" />
                {/* Data modules */}
                {[
                  [90,10],[110,10],[130,30],[90,30],
                  [90,50],[110,50],[90,70],[110,70],[130,70],
                  [150,90],[130,90],[110,90],[90,90],[70,90],
                  [50,90],[30,90],[10,90],
                  [10,110],[30,110],[50,110],[70,110],[90,110],
                  [110,110],[130,110],[150,110],[170,110],
                  [170,90],[170,70],[170,50],[170,30],[170,10],
                  [150,130],[130,130],[110,130],
                  [90,130],[90,150],[110,150],[130,150],
                  [150,150],[170,150],[170,170],[150,170],
                  [130,170],[110,170],[90,170],
                ].map(([x, y], i) => (
                  <rect key={i} x={x} y={y} width="16" height="16" rx="2" fill="#00205B" opacity={0.7} />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.05em",
            color: "#757683",
            margin: 0,
          }}
        >
          © 2024 QRVents Systems.
          <br />
          Enterprise Infrastructure Solutions.
        </p>
      </section>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <section
        style={{
          width: "55%",
          flexShrink: 0,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 96px",
          backgroundColor: "#00205B",
          color: "#ffffff",
          overflowY: "auto",
        }}
      >
        {/* Subtle background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            pointerEvents: "none",
            background: "linear-gradient(135deg, #001A4D 0%, #00205B 100%)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />

        {/* Content wrapper */}
        <div style={{ maxWidth: "448px", width: "100%", position: "relative", zIndex: 10 }}>
          {/* Heading */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 600,
              marginBottom: "8px",
              letterSpacing: "-0.025em",
              color: "#ffffff",
              margin: "0 0 8px 0",
            }}
          >
            Access Portal
          </h1>

          {/* Subheading */}
          <p
            style={{
              fontSize: "14px",
              marginBottom: "40px",
              fontWeight: 500,
              letterSpacing: "0.025em",
              color: "#b5c4ff",
              margin: "0 0 40px 0",
            }}
          >
            Enter your credentials to continue
          </p>

          {/* Login Form */}
          <LoginForm />

          {/* Registration line */}
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.025em", color: "#b5c4ff", margin: 0 }}>
              Need an account?
              <Link
                href="/register"
                style={{ marginLeft: "4px", color: "#ffffff", textDecoration: "underline", textUnderlineOffset: "4px" }}
              >
                Register Here
              </Link>
            </p>
          </div>

          {/* Bottom divider row */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.025em",
              color: "#b5c4ff",
            }}
          >
            <a href="#" style={{ color: "#b5c4ff", textDecoration: "none" }}>
              Security Policy
            </a>
            <a href="#" style={{ color: "#b5c4ff", textDecoration: "none" }}>
              Terms of Service
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
