export function StatCardsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ background: "white", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "46px", height: "46px", background: "#F1F5F9", borderRadius: "12px", animation: "pulse 2s infinite ease-in-out" }} />
          <div>
            <div style={{ width: "60px", height: "32px", background: "#F1F5F9", borderRadius: "6px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "120px", height: "13px", background: "#F1F5F9", borderRadius: "4px", marginTop: "8px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
        </div>
      ))}
    </div>
  )
}
