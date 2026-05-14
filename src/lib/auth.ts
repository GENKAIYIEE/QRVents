import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { COOKIE_NAME, PORTAL_ROUTES } from "./constants"
import type { SessionPayload } from "@/types"

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET!
)

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(
    payload as unknown as Record<string, unknown>
  )
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secretKey)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function getRedirectForRole(role: string) {
  return PORTAL_ROUTES[role as keyof typeof PORTAL_ROUTES] ?? "/login"
}
