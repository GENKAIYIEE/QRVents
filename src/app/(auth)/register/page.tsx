import { prisma } from "@/lib/prisma"
import RegisterForm from "@/components/auth/RegisterForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create your account — QRVents",
  description: "Register for QRVents Student Account",
}

export default async function RegisterPage() {
  const rawDepartments = await prisma.department.findMany({
    select: { id: true, name: true, code: true },
  })

  const EXACT_ORDER = [
    "BSIT",
    "BEED/BSED",
    "BSHM",
    "BSTM",
    "BSBA",
    "BSCRIM",
    "BSMARINE"
  ]

  const departments = rawDepartments
    .filter(d => EXACT_ORDER.includes(d.code))
    .sort((a, b) => EXACT_ORDER.indexOf(a.code) - EXACT_ORDER.indexOf(b.code))

  return (
    <main
      style={{
        backgroundColor: "#f8f9ff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px", zIndex: 10, position: "relative" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(196, 197, 211, 0.3)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "32px 32px 24px 32px",
              textAlign: "center",
              borderBottom: "1px solid rgba(196, 197, 211, 0.3)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "64px",
                height: "64px",
                backgroundColor: "rgba(0, 35, 111, 0.1)",
                borderRadius: "50%",
                marginBottom: "16px",
              }}
            >
              <span
                className="material-symbols-outlined icon-fill"
                style={{ color: "#00236f", fontSize: "32px", lineHeight: 1 }}
              >
                qr_code_scanner
              </span>
            </div>
            <h1
              style={{
                fontWeight: 600,
                fontSize: "24px",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                color: "#0b1c30",
                margin: "0 0 4px 0",
              }}
            >
              Create your account
            </h1>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#444652",
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Polytechnic College of La Union
            </p>
          </div>

          {/* Form */}
          <RegisterForm departments={departments} />

          {/* Footer */}
          <div
            style={{
              padding: "0 24px 24px 24px",
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(196, 197, 211, 0.3)",
            }}
          >
            <a
              href="/login"
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#444652",
                textDecoration: "none",
                display: "inline-block",
                paddingTop: "24px",
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.2s",
              }}
            >
              Already have an account?{" "}
              <span style={{ color: "#00236f", fontWeight: 600 }}>Sign in</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
