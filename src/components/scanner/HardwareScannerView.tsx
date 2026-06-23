"use client"

import { useEffect, useRef, useState } from "react"

interface HardwareScannerViewProps {
  isActive: boolean
  onScan: (qrCode: string) => void
  isProcessing?: boolean
}

export function HardwareScannerView({ isActive, onScan, isProcessing = false }: HardwareScannerViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState("")

  // Keep focus on the input as long as it's active
  useEffect(() => {
    if (isActive && !isProcessing) {
      inputRef.current?.focus()
    }
  }, [isActive, isProcessing])

  const handleBlur = () => {
    if (isActive && !isProcessing) {
      // Small timeout to allow intentional blurs (like clicking a button) but refocus immediately otherwise
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onScan(value.trim())
      setValue("")
    }
  }

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-slate-900 aspect-square sm:aspect-video shadow-2xl border-4 border-slate-800 flex flex-col items-center justify-center text-center p-8 cursor-text select-none group"
      onClick={() => inputRef.current?.focus()}
    >
      <input
         ref={inputRef}
         type="text"
         value={value}
         onChange={(e) => setValue(e.target.value)}
         onKeyDown={handleKeyDown}
         onBlur={handleBlur}
         className="absolute opacity-0 w-1 h-1 -z-10"
         autoFocus
         disabled={isProcessing || !isActive}
      />
      
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-blue-600">sync</span>
            <span className="font-bold text-slate-800 text-sm">Processing Scan...</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
            <div className="w-28 h-28 bg-slate-800/80 rounded-full flex items-center justify-center border-4 border-slate-700/50 group-hover:border-blue-500/50 transition-colors shadow-xl relative z-10">
              <span className="material-symbols-outlined text-6xl text-blue-400">barcode_scanner</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Ready for Scan</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto">
              Aim your hardware scanner at the QR code and pull the trigger.
            </p>
            
            {value && (
              <div className="mt-6 flex justify-center">
                <span className="bg-slate-800 text-blue-400 px-4 py-2 rounded-xl text-sm tracking-widest font-mono font-bold shadow-inner border border-slate-700/50">
                  {value}
                  <span className="animate-pulse">_</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
