export function RecentAttendanceSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ padding: "16px 20px", borderBottom: i === 3 ? "none" : "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: "50%", height: "16px", background: "#F1F5F9", borderRadius: "4px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "30%", height: "12px", background: "#F1F5F9", borderRadius: "4px", marginTop: "8px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <div style={{ width: "60px", height: "16px", background: "#F1F5F9", borderRadius: "10px", animation: "pulse 2s infinite ease-in-out" }} />
            <div style={{ width: "80px", height: "12px", background: "#F1F5F9", borderRadius: "4px", animation: "pulse 2s infinite ease-in-out" }} />
          </div>
        </div>
      ))}
    </div>
  )
}
