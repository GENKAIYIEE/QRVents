"use client"

import { useEffect } from "react"

export interface ScanResultData {
  type: "success" | "error"
  action?: "check-in" | "check-out"
  isLate?: boolean
  user?: { fullName: string; isGuest?: boolean }
  message: string
}

interface ScanResultProps {
  result: ScanResultData | null
  onClear: () => void
}

export function ScanResult({ result, onClear }: ScanResultProps) {
  // Auto-clear result after 4 seconds (extra time for late warning to be read)
  useEffect(() => {
    if (result) {
      const delay = result.isLate ? 5000 : 3000
      const timer = setTimeout(onClear, delay)
      return () => clearTimeout(timer)
    }
  }, [result, onClear])

  if (!result) return null

  const isSuccess = result.type === "success"
  const isGuest = result.user?.isGuest
  const isLate = result.isLate

  // Priority: Late > Guest > Error > Success
  const bgClass = !isSuccess
    ? "bg-rose-50 border-rose-200"
    : isLate
    ? "bg-amber-50 border-amber-300"
    : isGuest
    ? "bg-sky-50 border-sky-200"
    : "bg-emerald-50 border-emerald-200"

  const textClass = !isSuccess
    ? "text-rose-800"
    : isLate
    ? "text-amber-900"
    : isGuest
    ? "text-sky-800"
    : "text-emerald-800"

  const iconColor = !isSuccess
    ? "text-rose-500"
    : isLate
    ? "text-amber-500"
    : isGuest
    ? "text-sky-500"
    : "text-emerald-500"

  const icon = !isSuccess
    ? "error"
    : isLate
    ? "schedule"
    : result.action === "check-out"
    ? "logout"
    : "check_circle"

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`p-5 rounded-2xl border shadow-2xl flex items-start gap-4 ${bgClass}`}>
        <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}>
          <span className="material-symbols-outlined text-[28px] [font-variation-settings:'FILL'_1]">{icon}</span>
        </div>
        
        <div className="flex-1 pt-1">
          <h3 className={`font-extrabold text-lg leading-tight mb-1 ${textClass}`}>
            {result.user ? result.user.fullName : "Scan Failed"}
          </h3>
          <p className={`${textClass} opacity-80 text-sm font-medium`}>
            {result.message}
          </p>
          
          {isLate && isSuccess && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider rounded-md">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Late — Penalty Issued
            </div>
          )}

          {isGuest && isSuccess && !isLate && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider rounded-md">
              <span className="material-symbols-outlined text-[14px]">badge</span>
              Guest Attendee
            </div>
          )}
        </div>
        
        <button 
          onClick={onClear}
          className={`p-2 rounded-full hover:bg-white/50 transition-colors ${textClass}`}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
  )
}
