"use client"

import { useState, useEffect, useRef } from "react"
import { PinLockScreen } from "@/components/scanner/PinLockScreen"
import { ScannerView } from "@/components/scanner/ScannerView"
import { EventSelector } from "@/components/scanner/EventSelector"
import { ScanResult, ScanResultData } from "@/components/scanner/ScanResult"
import { HardwareScannerView } from "@/components/scanner/HardwareScannerView"
import { ChangePinModal } from "@/components/scanner/ChangePinModal"
import { toast } from "sonner"

interface Event {
  id: string
  title: string
  date: string | Date
  venue: string
}

interface ScannerClientProps {
  events: Event[]
  autoLockSeconds: number
  basePath: string // "admin" or "dept" for the breadcrumb
}

export function ScannerClient({ events, autoLockSeconds, basePath }: ScannerClientProps) {
  const [hasPin, setHasPin] = useState<boolean | null>(null)
  const [isLocked, setIsLocked] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null)
  const [scanMode, setScanMode] = useState<"camera" | "hardware">("camera")
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null)
  const [isChangePinOpen, setIsChangePinOpen] = useState(false)

  const lockTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial PIN status
  useEffect(() => {
    fetch("/api/scanner/pin")
      .then(res => res.json())
      .then(data => {
        setHasPin(data.hasPin)
        setIsLocked(true)
      })
      .catch(() => {
        toast.error("Failed to verify scanner security")
        setHasPin(false)
      })
  }, [])

  // Auto-lock timer disabled by user request
  // The scanner will now only lock if the user clicks the manual 'Lock Scanner' button.

  const handleScan = async (qrCode: string) => {
    if (!selectedEventId) {
      toast.warning("Please select an event first")
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode, eventId: selectedEventId }),
      })
      const data = await res.json()

      if (res.ok) {
        setScanResult({
          type: "success",
          action: data.action,
          user: data.user,
          message: data.message,
        })
      } else {
        setScanResult({
          type: "error",
          user: data.user,
          message: data.error,
        })
      }
    } catch {
      setScanResult({
        type: "error",
        message: "Network error processing scan",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative flex flex-col gap-6 min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
            <span className="text-slate-300 text-xs font-bold">/</span>
            <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">{basePath} Scanner</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Event Scanner</h1>
        </div>
        
        {!isLocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsChangePinOpen(true)}
              className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-colors tooltip-trigger"
              title="Change Security PIN"
            >
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
            </button>
            <button
              onClick={() => {
                setIsLocked(true)
                setScanResult(null)
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Lock Scanner
            </button>
          </div>
        )}
      </div>

      {!isLocked && (
        <div className="flex justify-center mb-[-1rem] z-10 relative">
          <div className="bg-slate-200/50 p-1 rounded-2xl flex items-center gap-1 shadow-inner border border-slate-200">
            <button
              onClick={() => setScanMode("camera")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                scanMode === "camera" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              Built-in Camera
            </button>
            <button
              onClick={() => setScanMode("hardware")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                scanMode === "hardware" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              Hardware Scanner
            </button>
          </div>
        </div>
      )}

      {isLocked ? (
        <div className="flex-1 relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl min-h-[500px]">
          <PinLockScreen 
            hasPin={hasPin}
            onSetup={() => { setHasPin(true); setIsLocked(false); }}
            onUnlock={() => setIsLocked(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start animate-in fade-in duration-500">
          <div className="flex-1 w-full relative">
            {scanMode === "camera" ? (
              <ScannerView 
                isActive={!isLocked} 
                isProcessing={isProcessing}
                onScan={handleScan} 
              />
            ) : (
              <HardwareScannerView 
                isActive={!isLocked} 
                isProcessing={isProcessing}
                onScan={handleScan} 
              />
            )}
          </div>
          
          <div className="w-full lg:w-[350px] shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <EventSelector 
                events={events} 
                selectedEventId={selectedEventId} 
                onSelect={setSelectedEventId} 
                disabled={isProcessing}
              />
            </div>

            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">info</span>
                Scanner Guide
              </h3>
              <ul className="text-sm text-slate-600 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">check_circle</span>
                  Select the active event before scanning.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">check_circle</span>
                  Scanning a student once checks them IN. Scanning again checks them OUT.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5">check_circle</span>
                  Scanner stays active until manually locked.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <ScanResult result={scanResult} onClear={() => setScanResult(null)} />

      <ChangePinModal 
        isOpen={isChangePinOpen} 
        onClose={() => setIsChangePinOpen(false)} 
        onSuccess={() => setIsChangePinOpen(false)}
      />
    </div>
  )
}
