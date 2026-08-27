"use client"

import { useState, useRef, useEffect } from "react"
import { Download, ChevronDown, FileText, Calendar, Users, X } from "lucide-react"
import { generateEventReportPDF, ReportData } from "@/lib/pdf-export"
import { toast } from "sonner"

interface PdfExportButtonProps {
  eventId: string
  departmentId: string
  eventName: string
}

export function PdfExportButton({ eventId, departmentId, eventName }: PdfExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  // Modals for specific inputs
  const [showYearModal, setShowYearModal] = useState(false)
  const [showSectionModal, setShowSectionModal] = useState(false)
  
  const [selectedYear, setSelectedYear] = useState("1")
  const [selectedSection, setSelectedSection] = useState("")

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleExport = async (type: string, yearLevel: string = "ALL", section: string = "ALL") => {
    try {
      setIsExporting(true)
      setIsOpen(false)
      setShowYearModal(false)
      setShowSectionModal(false)

      // Normalize empty string to "ALL" — handles Dept Admin context where
      // the server will override with the session's own departmentId anyway.
      const resolvedDepartmentId = departmentId || "ALL"

      const query = new URLSearchParams({
        eventId,
        departmentId: resolvedDepartmentId,
        yearLevel,
        section
      })

      const res = await fetch(`/api/reports/export-json?${query.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch report data")
      
      const data = await res.json()

      // Warn the user if there are a lot of records — PDF generation may take a moment
      if (data.logs.length > 300) {
        toast.info(`Generating report for ${data.logs.length} records. This may take a moment...`, { duration: 4000 })
      }
      
      let reportTypeName = "Overall Report"
      if (yearLevel !== "ALL") reportTypeName = `${yearLevel}${yearLevel === '1' ? 'st' : yearLevel === '2' ? 'nd' : yearLevel === '3' ? 'rd' : 'th'} Year Report`
      if (section !== "ALL") reportTypeName = `Section ${section.toUpperCase()} Report`

      const reportData: ReportData = {
        eventName,
        eventDate: new Date(data.event.date),
        reportType: reportTypeName,
        logs: data.logs
      }

      await generateEventReportPDF(reportData)
      toast.success(`${reportTypeName} generated successfully`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF report")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 px-4 py-2.5 font-bold rounded-xl shadow-sm transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20`}
      >
        {isExporting ? (
          <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
        ) : (
          <Download className="w-4 h-4" /> 
        )}
        Export PDF
        <ChevronDown className="w-4 h-4 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={() => handleExport("ALL")}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Overall Report
          </button>
          <button 
            onClick={() => { setIsOpen(false); setShowYearModal(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            By Year Level
          </button>
          <button 
            onClick={() => { setIsOpen(false); setShowSectionModal(true); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left"
          >
            <Users className="w-4 h-4 text-slate-400" />
            By Section
          </button>
        </div>
      )}

      {/* Year Level Modal */}
      {showYearModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowYearModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Export by Year Level</h3>
              <button onClick={() => setShowYearModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Select Year</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <button
                onClick={() => handleExport("YEAR", selectedYear, "ALL")}
                className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSectionModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Export by Section</h3>
              <button onClick={() => setShowSectionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Section Name</label>
                <input 
                  type="text"
                  placeholder="e.g. A, B, or 1A"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-700"
                  autoFocus
                />
              </div>
              <button
                onClick={() => {
                  if (!selectedSection.trim()) {
                    toast.error("Please enter a section")
                    return
                  }
                  handleExport("SECTION", "ALL", selectedSection.trim())
                }}
                className="w-full py-2.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
