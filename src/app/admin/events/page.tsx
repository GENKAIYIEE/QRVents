// Stub page config — each item becomes a self-contained placeholder page
// Run this to see what's coming next in QRVents

export default function EventsPage() {
  return <ComingSoon icon="calendar_month" title="Events" desc="Create and manage campus-wide and department events. Set dates, venues, expected attendance, and publish to students." color="#8B5CF6" bg="#F5F3FF" />
}

function ComingSoon({ icon, title, desc, color, bg }: { icon: string; title: string; desc: string; color: string; bg: string }) {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span className="material-symbols-outlined" style={{ color: "#3B82F6", fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>home</span>
          <span style={{ color: "#94A3B8", fontSize: "12px" }}>Dashboard</span>
          <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#CBD5E1" }}>chevron_right</span>
          <span style={{ color: "#64748B", fontSize: "12px", fontWeight: 600 }}>{title}</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>{title}</h1>
      </div>

      <div style={{
        background: "white",
        borderRadius: "20px",
        border: "1px solid #F1F5F9",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 40px",
        textAlign: "center",
        minHeight: "500px",
      }}>
        <div style={{ width: "88px", height: "88px", background: bg, borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: `0 8px 32px ${color}25` }}>
          <span className="material-symbols-outlined" style={{ color, fontSize: "44px", fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "20px", padding: "6px 14px", marginBottom: "20px" }}>
          <span className="material-symbols-outlined" style={{ color: "#D97706", fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>construction</span>
          <span style={{ color: "#92400E", fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px" }}>COMING SOON</span>
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", marginBottom: "12px" }}>{title} Module</h2>
        <p style={{ color: "#64748B", fontSize: "14px", maxWidth: "420px", lineHeight: 1.6 }}>{desc}</p>
        <a href="/admin/dashboard" style={{
          marginTop: "32px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
          color: "white",
          padding: "12px 24px",
          borderRadius: "10px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "13px",
          boxShadow: "0 4px 15px rgba(59,130,246,0.35)",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
          Back to Dashboard
        </a>
      </div>
    </div>
  )
}
