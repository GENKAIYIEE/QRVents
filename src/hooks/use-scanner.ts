"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Html5Qrcode } from "html5-qrcode"

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
  const scannerRef = useRef<Html5Qrcode | null>(null)
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

      const config = {
        fps,
        disableFlip: false,
      }

      const onScanSuccess = (decodedText: string) => {
        if (!isMountedRef.current) return
        const result = { text: decodedText, timestamp: new Date() }
        setLastResult(result)
        onScan(decodedText)
      }
      const onScanFailure = () => {}

      try {
        // First try the environment (rear) camera
        await scanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "NotAllowedError") throw err
        
        // If environment camera fails (common on laptops), fetch available cameras and use the first one
        const cameras = await Html5Qrcode.getCameras()
        if (cameras && cameras.length > 0) {
          // Ensure we completely stopped the previous failed instance before restarting
          if (scanner.isScanning) await scanner.stop()
          scanner.clear()
          
          await scanner.start(cameras[0].id, config, onScanSuccess, onScanFailure)
        } else {
          throw new Error("No cameras found on this device.")
        }
      }

      if (isMountedRef.current) {
        setStatus("scanning")
      }
    } catch (err: unknown) {
      const isPermissionDenied = err instanceof Error && err.name === "NotAllowedError"
      const message = isPermissionDenied
        ? "Camera permission denied. Please allow camera access."
        : err instanceof Error ? err.message : "Failed to start scanner."

      if (isMountedRef.current) {
        setStatus(isPermissionDenied ? "permission_denied" : "error")
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
