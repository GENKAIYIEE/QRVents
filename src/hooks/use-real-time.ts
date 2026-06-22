"use client"

import { useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase"

type RealtimeCallback = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Record<string, unknown>
  old: Record<string, unknown>
}) => void

interface UseRealTimeOptions {
  /** The Supabase table name to subscribe to */
  table: string
  /** Optional: filter by a column value (e.g., { column: "userId", value: "abc123" }) */
  filter?: { column: string; value: string }
  /** Callback fired when any row change occurs */
  onInsert?: RealtimeCallback
  onUpdate?: RealtimeCallback
  onDelete?: RealtimeCallback
  onChange?: RealtimeCallback
  /** Whether the subscription is active */
  enabled?: boolean
}

/**
 * Subscribe to real-time Supabase table changes.
 *
 * @example
 * useRealTime({
 *   table: "notifications",
 *   filter: { column: "userId", value: session.userId },
 *   onInsert: (payload) => console.log("New notification:", payload.new),
 * })
 */
export function useRealTime({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealTimeOptions) {
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      const supabase = createClient()
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!enabled) return cleanup

    const supabase = createClient()

    // Build the filter string for Supabase Realtime
    const filterString = filter
      ? `${filter.column}=eq.${filter.value}`
      : undefined

    const channelName = `${table}${filter ? `:${filter.column}:${filter.value}` : ""}`

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filterString ? { filter: filterString } : {}),
        },
        (payload) => {
          const typedPayload = {
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: payload.new as Record<string, unknown>,
            old: payload.old as Record<string, unknown>,
          }

          onChange?.(typedPayload)

          if (payload.eventType === "INSERT") onInsert?.(typedPayload)
          if (payload.eventType === "UPDATE") onUpdate?.(typedPayload)
          if (payload.eventType === "DELETE") onDelete?.(typedPayload)
        }
      )
      .subscribe()

    channelRef.current = channel

    return cleanup
  }, [table, filter?.column, filter?.value, enabled, cleanup])

  return { cleanup }
}
