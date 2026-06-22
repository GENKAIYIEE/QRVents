"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { ScanLine, RefreshCw, BadgeInfo, Download } from "lucide-react"
import { getStudentQRCode } from "./actions"

type StudentInfo = {
  fullName: string
  email: string
  qrCode: string
  studentId: string | null
  yearLevel: string | null
  departmentCode: string
  departmentName: string
  departmentColor: string
}

export function QrClient() {
  const [data, setData] = useState<StudentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const res = await getStudentQRCode()
      setData(res)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    // A simple function to trigger browser download of the SVG
    const svg = document.getElementById("student-qr-svg")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    // Setup canvas size
    canvas.width = 1000
    canvas.height = 1150

    img.onload = () => {
      // Draw white background
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw Header Text
        ctx.fillStyle = "#0F1E45"
        ctx.font = "bold 70px system-ui, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("QRVents Pass", canvas.width / 2, 120)
        
        // Draw Student Name
        ctx.fillStyle = "#334155"
        ctx.font = "bold 45px system-ui, sans-serif"
        ctx.fillText(data?.fullName || "", canvas.width / 2, 190)

        // Draw Department
        ctx.fillStyle = data?.departmentColor || "#3B82F6"
        ctx.font = "bold 30px system-ui, sans-serif"
        ctx.fillText(data?.departmentName || "", canvas.width / 2, 240)

        // Draw QR Code (Centered)
        ctx.drawImage(img, 150, 280, 700, 700)
        
        // Draw Footer
        ctx.fillStyle = "#94A3B8"
        ctx.font = "30px system-ui, sans-serif"
        ctx.fillText("Scan this at the event entrance", canvas.width / 2, 1050)
        
        // Trigger download
        const a = document.createElement("a")
        a.download = `QRVents-${data?.fullName.replace(/\s+/g, '-')}-Pass.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <span className="material-symbols-outlined animate-spin text-blue-500 text-4xl [font-variation-settings:'FILL'_1]">progress_activity</span>
        <p className="text-sm font-bold text-slate-500">Generating Digital Pass...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
          <span className="text-slate-300 text-xs font-bold">/</span>
          <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Digital Pass</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">My QR Code</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">Show this digital pass to the event admins to scan your attendance instantly.</p>
      </div>

      <div className="flex justify-center mt-4">
        
        {/* Digital ID Card */}
        <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col items-center">
          
          {/* Card Header (Dept Color) */}
          <div 
            className="w-full pt-8 pb-12 px-6 text-center relative overflow-hidden"
            style={{ backgroundColor: data.departmentColor }}
          >
            {/* Background design elements */}
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-black/10" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-white/30">
                <ScanLine className="text-white w-6 h-6" />
              </div>
              <h2 className="text-white text-2xl font-black tracking-tight leading-none">QRVents Pass</h2>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2">{data.departmentName}</p>
            </div>
          </div>

          {/* QR Code Container - Negative Margin to pull it up into the header */}
          <div className="relative z-20 -mt-8 bg-white p-4 rounded-3xl shadow-xl shadow-black/5">
            <div className="border-[3px] border-dashed border-slate-200 p-2 rounded-2xl bg-white">
              <QRCodeSVG 
                id="student-qr-svg"
                value={data.qrCode} 
                size={220}
                level="H"
                includeMargin={true}
                fgColor="#0F172A"
                bgColor="#FFFFFF"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Student Details */}
          <div className="w-full px-8 pt-8 pb-8 flex flex-col items-center text-center">
            <h3 className="text-2xl font-extrabold text-slate-900 leading-tight">{data.fullName}</h3>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                {data.yearLevel || "Student"}
              </span>
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${data.departmentColor}15`, color: data.departmentColor }}
              >
                {data.departmentCode}
              </span>
            </div>

            {data.studentId && (
              <>
                <div className="w-full h-px bg-slate-100 my-6"></div>

                <div className="flex items-center justify-center gap-2 text-slate-500 bg-slate-50 px-4 py-3 rounded-xl w-full">
                  <BadgeInfo size={16} className="text-blue-500" />
                  <span className="text-xs font-bold">ID: {data.studentId}</span>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div className="flex justify-center gap-4 mt-2">
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <Download size={16} />
          Save to Phone
        </button>
      </div>

    </div>
  )
}
