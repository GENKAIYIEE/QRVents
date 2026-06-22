"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type ScanStatus =
  | "idle"
  | "initializing"
  | "scanning"
  | "success"
  | "error"
  | "permission_denied"

interface ScanResult {
  text: string
  timestamp: Date
}

interface UseScannerOptions {
  /** The HTML element ID to mount the scanner into */
  elementId: string
  /** Callback fired when a QR code is successfully scanned */
  onScan: (text: string) => void
  /** Callback fired on scanner error */
  onError?: (error: string) => void
  /** Frames per second for scanning (default: 10) */
  fps?: number
  /** Whether to start scanning immediately (default: false) */
  autoStart?: boolean
}

interface UseScannerReturn {
  status: ScanStatus
  start: () => Promise<void>
  stop: () => Promise<void>
  isScanning: boolean
  lastResult: ScanResult | null
  error: string | null
}

/**
 * Hook for camera-based QR code scanning using html5-qrcode.
 * Handles camera initialization, permission errors, and cleanup.
 */
export function useScanner({
  elementId,
  onScan,
  onError,
  fps = 10,
  autoStart = false,
}: UseScannerOptions): UseScannerReturn {
  const [status, setStatus] = useState<ScanStatus>("idle")
  const [lastResult, setLastResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<any>(null)
  const isMountedRef = useRef(true)

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const isRunning = scannerRef.current.isScanning
        if (isRunning) {
          await scannerRef.current.stop()
        }
        scannerRef.current.clear()
      } catch {
        // Ignore cleanup errors
      }
      scannerRef.current = null
    }
    if (isMountedRef.current) {
      setStatus("idle")
    }
  }, [])

  const start = useCallback(async () => {
    if (typeof window === "undefined") return

    setStatus("initializing")
    setError(null)

    try {
      // Dynamically import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode")

      // Stop any existing scanner
      if (scannerRef.current) {
        await stop()
      }

      const scanner = new Html5Qrcode(elementId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText: string) => {
          if (!isMountedRef.current) return
          const result = { text: decodedText, timestamp: new Date() }
          setLastResult(result)
          onScan(decodedText)
        },
        () => {
          // Ignore per-frame errors (expected while scanning)
        }
      )

      if (isMountedRef.current) {
        setStatus("scanning")
      }
    } catch (err: any) {
      const message =
        err?.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : err?.message || "Failed to start scanner."

      if (isMountedRef.current) {
        setStatus(err?.name === "NotAllowedError" ? "permission_denied" : "error")
        setError(message)
        onError?.(message)
      }
    }
  }, [elementId, fps, onScan, onError, stop])

  useEffect(() => {
    isMountedRef.current = true

    if (autoStart) {
      start()
    }

    return () => {
      isMountedRef.current = false
      stop()
    }
  }, [autoStart, start, stop])

  return {
    status,
    start,
    stop,
    isScanning: status === "scanning",
    lastResult,
    error,
  }
}
