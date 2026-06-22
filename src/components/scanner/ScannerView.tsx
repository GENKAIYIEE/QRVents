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
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-slate-900 aspect-square sm:aspect-video shadow-2xl border-4 border-slate-800">
      {status === "initializing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-300 z-10">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 mb-4">progress_activity</span>
          <p className="font-semibold text-sm tracking-wider uppercase">Initializing Camera...</p>
        </div>
      )}

      {status === "permission_denied" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-400 z-10 p-6 text-center">
          <span className="material-symbols-outlined text-5xl mb-4">no_photography</span>
          <p className="font-bold text-lg mb-2 text-white">Camera Access Denied</p>
          <p className="text-sm opacity-80 max-w-sm">Please enable camera permissions in your browser settings to use the scanner.</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-rose-400 z-10 p-6 text-center">
          <span className="material-symbols-outlined text-5xl mb-4">error</span>
          <p className="font-bold text-lg mb-2 text-white">Scanner Error</p>
          <p className="text-sm opacity-80 max-w-sm">{error || "Failed to start camera. Make sure no other app is using it."}</p>
          <button onClick={() => start()} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors">
            Try Again
          </button>
        </div>
      )}

      {/* The actual video element container */}
      <div id={containerId} className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />

      {/* Viewfinder Overlay */}
      {status === "scanning" && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Semi-transparent border overlay */}
          <div className="absolute inset-0 border-[40px] sm:border-[60px] border-slate-900/60 transition-all duration-500" />
          
          {/* Scanning Box Outline */}
          <div className="absolute inset-[40px] sm:inset-[60px] border-2 border-white/20">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-500" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-500" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-500" />
            
            {/* Animated Scanning Line */}
            {!isProcessing && (
              <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] absolute animate-[scan_2s_ease-in-out_infinite]" />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center transition-all animate-in fade-in">
                <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
                  <span className="font-bold text-slate-800 text-sm">Processing...</span>
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
