"use client"

import { useState, useEffect } from "react"

interface PinLockScreenProps {
  onUnlock: () => void
  onSetup: () => void
  hasPin: boolean | null // null means checking
  onExit?: () => void
}

export function PinLockScreen({ onUnlock, onSetup, hasPin, onExit }: PinLockScreenProps) {
  const [pin, setPin] = useState("")
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Handle PIN entry
  useEffect(() => {
    if (pin.length === 4) {
      if (hasPin === false) {
        // Setup flow
        handleSetup(pin)
      } else if (hasPin === true) {
        // Unlock flow
        handleUnlock(pin)
      }
    }
  }, [pin, hasPin])

  const handleSetup = async (enteredPin: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/scanner/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup", pin: enteredPin }),
      })
      if (res.ok) {
        onSetup() // PIN created successfully
      } else {
        setIsError(true)
        setPin("")
      }
    } catch {
      setIsError(true)
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlock = async (enteredPin: string) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/scanner/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate", pin: enteredPin }),
      })
      if (res.ok) {
        setIsError(false)
        onUnlock()
      } else {
        setIsError(true)
        setPin("")
      }
    } catch {
      setIsError(true)
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (num: string) => {
    if (pin.length < 4 && !isLoading) {
      setIsError(false)
      setPin(prev => prev + num)
    }
  }

  const handleDelete = () => {
    if (pin.length > 0 && !isLoading) {
      setIsError(false)
      setPin(prev => prev.slice(0, -1))
    }
  }

  if (hasPin === null) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-500 mb-4">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center text-white p-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Optional Exit Button */}
      {onExit && (
        <button 
          onClick={onExit}
          className="absolute top-6 left-6 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}

      <div className="w-20 h-20 rounded-3xl bg-blue-500/20 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-blue-400 [font-variation-settings:'FILL'_1]">
          {hasPin ? 'lock' : 'security'}
        </span>
      </div>

      <h2 className="text-2xl font-bold mb-2">
        {hasPin ? "Enter PIN to Unlock" : "Set up Scanner PIN"}
      </h2>
      <p className="text-slate-400 text-sm mb-8 text-center max-w-xs">
        {hasPin 
          ? "The scanner is locked to prevent unauthorized changes." 
          : "Create a 4-digit PIN to secure the scanner interface."}
      </p>

      {/* PIN Dots */}
      <div className={`flex gap-4 mb-12 ${isError ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              pin.length > i 
                ? (isError ? 'bg-rose-500 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-blue-400 scale-110 shadow-[0_0_10px_rgba(96,165,250,0.5)]')
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {isError && (
        <p className="text-rose-400 text-sm mb-4 font-medium animate-in fade-in slide-in-from-bottom-2">
          Incorrect PIN. Please try again.
        </p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            disabled={isLoading}
            className="h-16 rounded-full bg-slate-800 text-2xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <div /> {/* Empty cell */}
        <button
          onClick={() => handleKeyPress("0")}
          disabled={isLoading}
          className="h-16 rounded-full bg-slate-800 text-2xl font-semibold hover:bg-slate-700 active:bg-slate-600 transition-colors disabled:opacity-50"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="h-16 rounded-full bg-slate-800 text-2xl font-semibold flex items-center justify-center hover:bg-slate-700 active:bg-slate-600 transition-colors disabled:opacity-50 text-slate-400"
        >
          <span className="material-symbols-outlined">backspace</span>
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-5px); }
          40%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  )
}
