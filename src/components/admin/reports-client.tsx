"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { DeptBarChart } from "@/components/admin/dashboard-charts" // Reuse the dashboard chart

export function ReportsClient() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  const fetchReports = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      if (startDate) query.set("startDate", startDate)
      if (endDate) query.set("endDate", endDate)

      const res = await fetch(`/api/admin/reports?${query.toString()}`)
      const { data: resData } = await res.json()
      
      setData(resData)
    } catch (err) {
      console.error("Failed to fetch reports", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [startDate, endDate])

  const handleExportCSV = () => {
    if (!data) return

    const headers = ["Department", "Code", "Total Students", "Total Events", "Attendance Records"]
    const rows = (data.departments || []).map((d: any) => [
      d.name,
      d.code,
      d._count?.users ?? 0,
      d._count?.events ?? 0,
      d._count?.attendanceLogs ?? 0,
    ])

    const csvContent = [
      `# QRVents System Report`,
      `# Date Range: ${startDate} to ${endDate}`,
      `# Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
      "",
      `Total Events,${data.totalEvents ?? 0}`,
      `Total Students,${data.totalStudents ?? 0}`,
      `Total Attendance,${data.totalAttendance ?? 0}`,
      "",
      headers.join(","),
      ...rows.map((r: any[]) => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qrvents-report-${startDate}-to-${endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (!data) return
    window.print()
  }

  const chartData = data?.departments.map((d: any) => ({
    code: d.code,
    students: d._count.users,
    events: d._count.events,
    color: d.color
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-500 text-sm">home</span>
            <span className="text-slate-400 text-xs font-semibold">/</span>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Analytics & Reports</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">table_chart</span>
            Export Excel
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={loading || !data}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-sm shadow-rose-600/20"
          >
            <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button 
          onClick={fetchReports}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl transition-colors"
        >
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase">Total Events</div>
              </div>
              <div className="text-3xl font-black text-slate-800">{data.summary.totalEvents}</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase">Total Attendees</div>
              </div>
              <div className="text-3xl font-black text-slate-800">{data.summary.totalAttendance}</div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase">Avg / Event</div>
              </div>
              <div className="text-3xl font-black text-slate-800">{data.summary.avgAttendancePerEvent}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance by Department</h3>
              {data.departments.map((dept: any) => (
                <div key={dept.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-end mb-1 text-sm">
                    <span className="font-semibold text-slate-700">{dept.code}</span>
                    <span className="font-bold text-slate-900">{dept.attendanceCount}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: dept.color,
                        width: `${Math.max(1, (dept.attendanceCount / (data.summary.totalAttendance || 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Event Breakdown</h3>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Event Name</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Type</th>
                      <th className="px-6 py-4 text-right">Attendees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.eventsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No events found in this period.</td>
                      </tr>
                    ) : (
                      data.eventsList.map((event: any) => (
                        <tr key={event.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-bold text-slate-700">{event.title}</td>
                          <td className="px-6 py-3 text-slate-500">{format(new Date(event.date), "MMM d, yyyy")}</td>
                          <td className="px-6 py-3 text-center">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                              {event.eventType === 'SCHOOL_WIDE' ? 'School' : event.department?.code}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right font-black text-slate-800">
                            {event._count.attendanceLogs}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
