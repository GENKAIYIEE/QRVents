"use client"

import { useState, useEffect, useCallback } from "react"
import type { User, Role, Department } from "@/types"

interface AuthUser {
  id: string
  fullName: string
  email: string
  role: Role
  studentId?: string | null
  yearLevel?: string | null
  qrCode?: string | null
  isActive: boolean
  departmentId?: string | null
  department?: Department | null
}

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" })
      if (!res.ok) {
        setUser(null)
        return
      }
      const { user: fetchedUser } = await res.json()
      setUser(fetchedUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch: fetchUser,
  }
}
