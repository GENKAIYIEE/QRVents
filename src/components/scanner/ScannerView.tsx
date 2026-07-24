"use client"

import { useEffect, useRef } from "react"
import { useScanner } from "@/hooks/use-scanner"

interface ScannerViewProps {
  isActive: boolean
  onScan: (qrCode: string) => void
  isProcessing?: boolean
}

export function ScannerView({ isActive, onScan, isProcessing = false }: ScannerViewProps) {
  const containerId = "qr-scanner-container"
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScannedRef = useRef<string | null>(null)

  const { status, error, start, stop } = useScanner({
    elementId: containerId,
    fps: 10,
    onScan: (decodedText) => {
      if (isProcessing) return
      
      // Debounce identical scans within 3 seconds
      if (lastScannedRef.current === decodedText) return
      
      lastScannedRef.current = decodedText
      onScan(decodedText)

      // Reset the debounce lock after 3 seconds
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = setTimeout(() => {
        lastScannedRef.current = null
      }, 3000)
    },
  })

  // Start/Stop scanner based on isActive prop
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    if (isActive && status === "idle") {
      // Add a small delay to prevent React Strict Mode double-mount
      // from aborting the video play() request by quickly unmounting.
      timeoutId = setTimeout(() => start(), 300)
    } else if (!isActive && (status === "scanning" || status === "initializing")) {
      stop()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isActive, status, start, stop])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current)
    }
  }, [])

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden bg-slate-900 min-h-[500px] h-[60vh] sm:h-[550px] shadow-2xl border-4 border-slate-800 ring-1 ring-white/10">
      {status === "initializing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 z-10">
          <span className="material-symbols-outlined animate-spin text-5xl text-indigo-500 mb-6">progress_activity</span>
          <p className="font-bold text-sm tracking-widest uppercase text-indigo-200">Initializing Lens</p>
        </div>
      )}

      {status === "permission_denied" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-400 z-10 p-6 text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-rose-500">no_photography</span>
          <p className="font-black text-2xl mb-2 text-white tracking-tight">Camera Access Denied</p>
          <p className="text-sm text-slate-400 max-w-sm">Please enable camera permissions in your browser settings to use the scanner.</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-400 z-10 p-6 text-center">
          <span className="material-symbols-outlined text-6xl mb-4 text-rose-500">error</span>
          <p className="font-black text-2xl mb-2 text-white tracking-tight">Scanner Error</p>
          <p className="text-sm text-slate-400 max-w-sm">{error || "Failed to start camera. Make sure no other app is using it."}</p>
          <button onClick={() => start()} className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30">
            Retry Camera
          </button>
        </div>
      )}

      {/* The actual video element container */}
      <div id={containerId} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

      {/* Viewfinder Overlay */}
      {status === "scanning" && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Subtle vignette/border overlay */}
          <div className="absolute inset-0 border-[20px] sm:border-[40px] border-slate-950/60 transition-all duration-500" />
          
          {/* Scanning Box Outline */}
          <div className="absolute inset-[20px] sm:inset-[40px] border border-white/10 rounded-2xl overflow-hidden">
            
            {/* Focus Grid Overlay (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

            {/* Precision Corners */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            
            {/* Animated Laser Line */}
            {!isProcessing && (
              <div className="w-full h-[2px] bg-indigo-500 shadow-[0_0_20px_4px_rgba(99,102,241,0.8)] absolute animate-[scan_2.5s_ease-in-out_infinite]" />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center transition-all animate-in fade-in zoom-in duration-300">
                <div className="bg-white/95 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20">
                  <span className="material-symbols-outlined animate-spin text-indigo-600 text-[28px]">sync</span>
                  <span className="font-black text-slate-900 tracking-tight text-lg">Processing Code...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        /* Hide html5-qrcode's default UI elements */
        #qr-scanner-container img[alt="Info icon"] { display: none !important; }
        #qr-scanner-container select { display: none !important; }
        #qr-scanner-container a { display: none !important; }
      `}</style>
    </div>
  )
}
