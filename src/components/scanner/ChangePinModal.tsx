"use client"

import { useState } from "react"
import { toast } from "sonner"

interface ChangePinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ChangePinModal({ isOpen, onClose, onSuccess }: ChangePinModalProps) {
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPin !== confirmPin) {
      toast.error("New PINs do not match")
      return
    }

    if (newPin.length !== 4) {
      toast.error("PIN must be exactly 4 digits")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/scanner/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", oldPin, pin: newPin }),
      })
      
      const data = await res.json()
      if (res.ok) {
        toast.success("Security PIN updated successfully")
        setOldPin("")
        setNewPin("")
        setConfirmPin("")
        onSuccess()
        onClose()
      } else {
        toast.error(data.error || "Failed to update PIN")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[28px]">lock_reset</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Change Security PIN</h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Update the 4-digit PIN used to lock the scanner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Current PIN</label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              required
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono placeholder:tracking-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">New PIN</label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              required
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono placeholder:tracking-normal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Confirm New PIN</label>
            <input 
              type="password" 
              maxLength={4}
              pattern="\d{4}"
              required
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg tracking-[0.5em] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-mono placeholder:tracking-normal"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || newPin.length !== 4 || confirmPin.length !== 4 || oldPin.length !== 4}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            )}
            Update PIN
          </button>
        </form>
      </div>
    </div>
  )
}
