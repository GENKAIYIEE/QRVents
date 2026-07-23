"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { ScanLine, RefreshCw, BadgeInfo, Download, ChevronLeft } from "lucide-react"
import { getStudentQRCode, getStudentActiveEvents } from "./actions"
import { format } from "date-fns"

type StudentInfo = {
  fullName: string
  email: string
  id: string
  qrCode?: string | null
  studentId: string | null
  yearLevel: string | null
  departmentCode: string
  departmentName: string
  departmentColor: string
}

export function QrClient() {
  const [data, setData] = useState<StudentInfo | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [resData, resEvents] = await Promise.all([
        getStudentQRCode(),
        getStudentActiveEvents()
      ])
      setData(resData)
      setEvents(resEvents)
      
      // Update selected event if it's currently open
      if (selectedEvent) {
        const updatedSelected = resEvents.find((e: any) => e.id === selectedEvent.id)
        if (updatedSelected) setSelectedEvent(updatedSelected)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!selectedEvent) return
    const svg = document.getElementById("student-qr-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    canvas.width = 1000
    canvas.height = 1150

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = "#0F1E45"
        ctx.font = "bold 70px system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("Event Pass", canvas.width / 2, 120)
        
        ctx.fillStyle = "#334155"
        ctx.font = "bold 45px system-ui, sans-serif"
        ctx.fillText(data?.fullName || "", canvas.width / 2, 190)

        ctx.fillStyle = data?.departmentColor || "#3B82F6"
        ctx.font = "bold 30px system-ui, sans-serif"
        ctx.fillText(selectedEvent.title, canvas.width / 2, 240)

        ctx.drawImage(img, 150, 280, 700, 700)
        
        ctx.fillStyle = "#94A3B8"
        ctx.font = "30px system-ui, sans-serif"
        ctx.fillText("Scan this at the event entrance", canvas.width / 2, 1050)
        
        const a = document.createElement("a")
        a.download = `QRVents-${selectedEvent.title.replace(/\s+/g, '-')}-Pass.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="material-symbols-outlined animate-spin text-blue-500 text-4xl [font-variation-settings:'FILL'_1]">progress_activity</span>
        <p className="text-sm font-bold text-slate-500">Loading Active Events...</p>
      </div>
    )
  }

  // Fallback UI if QR Code is missing (Moved to correct outer scope)
  if (data && !data.qrCode) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-full pb-10">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto bg-white rounded-[2rem] border border-slate-100 mt-10">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <BadgeInfo className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">QR Code Unavailable</h2>
          <p className="text-slate-500 max-w-md mb-8">
            We couldn't load your digital QR pass. This may happen if your account was created improperly or if your pass got corrupted.
          </p>
          <button 
            onClick={() => window.location.href = "mailto:it-support@pclu.edu.ph?subject=Requesting%20New%20QR%20Code%20-%20" + encodeURIComponent(data.fullName)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Request IT Support for New QR
          </button>
        </div>
      </div>
    )
  }

  if (!selectedEvent) {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Generate Event Pass</h2>
            <p className="text-slate-500 text-sm mt-2">Select an event below to generate your unique check-in QR code.</p>
          </div>

          {events.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-4 [font-variation-settings:'FILL'_0]">event_busy</span>
              <h3 className="text-lg font-bold text-slate-700">No events today</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">There are no upcoming or ongoing events scheduled for today that you are eligible for.</p>
              
              <button 
                onClick={fetchData}
                className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh List
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map(event => {
                const log = event.attendanceLogs?.[0]
                const isCheckedOut = !!log?.checkOut
                const isCheckedIn = !!log && !isCheckedOut

                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-900/5 transition-all text-left gap-5 group"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          event.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</h3>
                      <div className="text-sm font-medium text-slate-500 flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                          {event.venue}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:pl-5">
                      {isCheckedOut ? (
                        <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">done_all</span>
                          Checked Out
                        </div>
                      ) : isCheckedIn ? (
                        <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-emerald-200">
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                          Checked In
                        </div>
                      ) : (
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">qr_code</span>
                          Generate
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Calculate dynamic payload specifically for this event
  const qrPayload = btoa(`QRV-EVT|${data?.id}|${selectedEvent.id}`)
  
  const log = selectedEvent.attendanceLogs?.[0]
  const isCheckedOut = !!log?.checkOut
  const isCheckedIn = !!log && !isCheckedOut

  return (
    <div className="max-w-md mx-auto w-full flex flex-col gap-6 pt-2">
      <div className="flex items-center">
        <button 
          onClick={() => setSelectedEvent(null)}
          className="flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white/60 px-4 py-2 rounded-full backdrop-blur-md border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Events
        </button>
      </div>

      {/* Digital ID Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Card Header (Dept Color) */}
        <div 
          className="w-full pt-8 pb-12 px-6 text-center relative overflow-hidden shrink-0"
          style={{ backgroundColor: data?.departmentColor || '#1A3A8F' }}
        >
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20 shadow-inner">
              <ScanLine className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{data?.fullName}</h2>
            <p className="text-white/80 font-medium mt-1 truncate max-w-[280px]">{selectedEvent.title}</p>
          </div>
        </div>

        {/* QR Section */}
        <div className="px-8 pb-8 pt-0 flex-1 flex flex-col items-center bg-white relative">
          <div className="w-full max-w-[260px] -mt-8 bg-white p-4 rounded-3xl shadow-xl shadow-black/5 relative z-20 mx-auto">
            <div className={`p-4 rounded-2xl border-2 transition-colors flex justify-center ${isCheckedOut ? 'border-slate-200 opacity-50' : isCheckedIn ? 'border-emerald-200' : 'border-slate-100'}`}>
              <QRCodeSVG
                id="student-qr-svg"
                value={qrPayload}
                size={200}
                level="Q"
                includeMargin={false}
                className="w-full h-auto max-w-[200px]"
              />
            </div>
          </div>

          <div className="mt-8 w-full">
            {isCheckedOut ? (
              <div className="flex items-center justify-center w-full gap-2 bg-slate-100 text-slate-600 px-4 py-3.5 rounded-xl text-sm font-bold">
                <span className="material-symbols-outlined text-[20px]">gpp_bad</span>
                QR Expired (Checked Out)
              </div>
            ) : isCheckedIn ? (
              <div className="flex items-center justify-center w-full gap-2 bg-emerald-50 text-emerald-600 px-4 py-3.5 rounded-xl text-sm font-bold border border-emerald-200">
                <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                Checked In - Scan to Check Out
              </div>
            ) : (
              <div className="flex items-center justify-center w-full gap-2 bg-blue-50 text-blue-600 px-4 py-3.5 rounded-xl text-sm font-bold border border-blue-200">
                <span className="material-symbols-outlined text-[20px]">info</span>
                Scan to Check In
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <button 
              onClick={fetchData}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={handleDownload}
              disabled={isCheckedOut}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Save Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
