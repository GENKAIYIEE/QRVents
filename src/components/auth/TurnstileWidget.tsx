"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"

type TurnstileRenderOptions = {
  sitekey: string
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "flexible" | "compact"
  callback: (token: string) => void
  "expired-callback": () => void
  "error-callback": () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// Cloudflare's published "always passes" test key. Only used outside production.
const DEV_TEST_SITE_KEY = "1x00000000000000000000AA"

const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  (process.env.NODE_ENV !== "production" ? DEV_TEST_SITE_KEY : "")

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void
  // Tokens are single-use. Bump this after a failed submit to get a fresh challenge.
  resetKey?: number
}

export function TurnstileWidget({ onToken, resetKey = 0 }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const [scriptReady, setScriptReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    if (!scriptReady || !SITE_KEY || !containerRef.current || !window.turnstile) return

    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      size: "flexible",
      callback: (token) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(null),
      "error-callback": () => {
        onTokenRef.current(null)
        setLoadFailed(true)
      },
    })
    widgetIdRef.current = widgetId

    return () => {
      window.turnstile?.remove(widgetId)
      widgetIdRef.current = null
    }
  }, [scriptReady])

  useEffect(() => {
    if (resetKey === 0 || !widgetIdRef.current) return
    window.turnstile?.reset(widgetIdRef.current)
  }, [resetKey])

  if (!SITE_KEY) {
    return (
      <p role="alert" className="text-sm text-red-600">
        The security check is not configured. Please contact your administrator.
      </p>
    )
  }

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setLoadFailed(true)}
      />
      <div ref={containerRef} className="w-full min-h-[65px]" />
      {loadFailed && (
        <p role="alert" className="text-xs text-red-600 mt-1.5">
          The security check could not load. Check your connection and refresh the page.
        </p>
      )}
    </div>
  )
}
