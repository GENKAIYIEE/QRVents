"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { RefreshCw, BadgeInfo, Download, MapPin, Clock, Check } from "lucide-react"
import { getStudentQRCode, getStudentActiveEvents } from "./actions"
import { formatTimeString } from "@/lib/utils"
import { toast } from "sonner"
import { QrPassSkeleton } from "@/components/student/qr-pass-skeleton"

type StudentInfo = Awaited<ReturnType<typeof getStudentQRCode>>
type ActiveEvent = Awaited<ReturnType<typeof getStudentActiveEvents>>[number]

const QR_SVG_ID = "student-qr-svg"

function getAttendanceState(event: ActiveEvent) {
  const log = event.attendanceLogs?.[0]
  if (log?.checkOut) {
    return { label: "Checked out", className: "bg-slate-100 text-slate-600 border-slate-200" }
  }
  if (log) {
    return { label: "Checked in", className: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  }
  return { label: "Not yet scanned", className: "bg-blue-50 text-blue-700 border-blue-200" }
}

export function QrClient() {
  const [data, setData] = useState<StudentInfo | null>(null)
  const [events, setEvents] = useState<ActiveEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [student, activeEvents] = await Promise.all([
          getStudentQRCode(),
          getStudentActiveEvents(),
        ])
        if (cancelled) return
        setData(student)
        setEvents(activeEvents)
        setLoadError(null)
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setLoadError("We couldn't load your pass. Check your connection and try again.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const handleRefresh = () => {
    setIsLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const handleDownload = () => {
    if (!data || isSaving) return
    const svg = document.getElementById(QR_SVG_ID)
    if (!svg) return

    setIsSaving(true)

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      setIsSaving(false)
      toast.error("Failed to generate pass image")
      return
    }

    canvas.width = 1000
    canvas.height = 1250

    const img = new Image()
    img.onload = () => {
      try {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = data.departmentColor || "#1A3A8F"
        ctx.fillRect(0, 0, canvas.width, 260)

        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.font = "bold 56px system-ui, sans-serif"
        ctx.fillText(data.fullName, canvas.width / 2, 120, 900)
        ctx.font = "34px system-ui, sans-serif"
        ctx.fillText(
          [data.studentId, data.departmentCode].filter(Boolean).join("  |  "),
          canvas.width / 2,
          190,
          900
        )

        ctx.drawImage(img, 150, 320, 700, 700)

        ctx.fillStyle = "#0F172A"
        ctx.font = "bold 40px system-ui, sans-serif"
        ctx.fillText("Student Event Pass", canvas.width / 2, 1100)
        ctx.fillStyle = "#64748B"
        ctx.font = "30px system-ui, sans-serif"
        ctx.fillText("Valid for all school events", canvas.width / 2, 1160)

        const link = document.createElement("a")
        link.download = `QRVents-${data.studentId || "student"}-Pass.png`
        link.href = canvas.toDataURL("image/png")
        link.click()

        setIsSaved(true)
        toast.success("Event pass saved to your downloads!")
        setTimeout(() => {
          setIsSaved(false)
        }, 2500)
      } catch (err) {
        console.error(err)
        toast.error("Failed to save image")
      } finally {
        setIsSaving(false)
      }
    }

    img.onerror = () => {
      setIsSaving(false)
      toast.error("Failed to process QR code")
    }

    // Rasterize the on-screen SVG so the saved pass matches what the scanner reads.
    const svgData = new XMLSerializer().serializeToString(svg)
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  if (isLoading && !data) {
    return <QrPassSkeleton />
  }

  if (loadError && !data) {
    return (
      <div className="max-w-md mx-auto w-full mt-10 bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <BadgeInfo className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Pass unavailable</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">{loadError}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      </div>
    )
  }

  if (!data || !data.qrCode) {
    return (
      <div className="max-w-md mx-auto w-full mt-10 bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <BadgeInfo className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">QR code unavailable</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Your account has no QR code yet. Please contact IT support to have one issued.
        </p>
        <a
          href={`mailto:it-support@pclu.edu.ph?subject=${encodeURIComponent(`Requesting New QR Code - ${data?.fullName ?? ""}`)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Email IT support
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto w-full flex flex-col gap-6 pb-10">
      <section
        aria-labelledby="student-pass-heading"
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
      >
        <div
          className="px-6 py-5 text-white"
          style={{ backgroundColor: data.departmentColor || "#1A3A8F" }}
        >
          <h2 id="student-pass-heading" className="text-xl font-bold leading-tight break-words">
            {data.fullName}
          </h2>
          <p className="text-sm text-white/85 mt-1">
            {[data.studentId, data.departmentCode, data.yearLevel ? `Year ${data.yearLevel}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col items-center">
          <div
            className={`p-4 rounded-xl border bg-white transition-all duration-150 ${
              isSaved ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"
            }`}
          >
            <QRCodeSVG
              id={QR_SVG_ID}
              value={data.qrCode}
              size={200}
              level="Q"
              marginSize={0}
              className="w-full h-auto max-w-[200px]"
            />
          </div>
          <p className="text-sm text-slate-500 text-center mt-4 max-w-xs">
            Show this QR code at the entrance of any event. It works for every event you attend.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleDownload}
              disabled={isSaving}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                isSaved
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-900 text-white hover:bg-black"
              } disabled:opacity-75 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Save pass
                </>
              )}
            </button>
          </div>
          {loadError && (
            <p role="alert" className="text-xs text-rose-600 mt-3 text-center">
              {loadError}
            </p>
          )}
        </div>
      </section>

      <section
        aria-labelledby="todays-events-heading"
        className="bg-white rounded-2xl border border-slate-200"
      >
        <h3
          id="todays-events-heading"
          className="px-5 py-4 text-sm font-bold text-slate-900 border-b border-slate-200"
        >
          Today&apos;s events
        </h3>

        {events.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">
            No events today that you are eligible for.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {events.map((event) => {
              const state = getAttendanceState(event)
              return (
                <li key={event.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 break-words">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {formatTimeString(event.startTime)} - {formatTimeString(event.endTime)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="break-words">{event.venue}</span>
                    </p>
                    {event.isMandatory && (
                      <p className="text-xs font-semibold text-rose-600 mt-1.5">
                        Mandatory - penalty applies if absent
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${state.className}`}
                  >
                    {state.label}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
