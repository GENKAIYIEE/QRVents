export function UpcomingEventsSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ padding: "16px", borderRadius: "14px", background: "white", border: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "60%", height: "20px", background: "#F1F5F9", borderRadius: "6px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "20%", height: "16px", background: "#F1F5F9", borderRadius: "10px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "80px", height: "14px", background: "#F1F5F9", borderRadius: "6px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "100px", height: "14px", background: "#F1F5F9", borderRadius: "6px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
            <div style={{ width: "70%", height: "14px", background: "#F1F5F9", borderRadius: "4px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "50%", height: "14px", background: "#F1F5F9", borderRadius: "4px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #E2E8F0" }}>
            <div style={{ width: "90%", height: "12px", background: "#F1F5F9", borderRadius: "4px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
        </div>
      ))}
    </div>
  )
}
