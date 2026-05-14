import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { COOKIE_NAME } from "@/lib/constants"

const secretKey = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET!
)

const ROLE_REDIRECT: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  DEPT_ADMIN:  "/dept/dashboard",
  STUDENT:     "/student/dashboard",
}

// Prefix map — role → allowed route prefix
const PREFIX_MAP: Record<string, string> = {
  SUPER_ADMIN: "/admin",
  DEPT_ADMIN:  "/dept",
  STUDENT:     "/student",
}

const PROTECTED_PREFIXES = ["/admin", "/dept", "/student"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isLoginPage  = pathname === "/login"

  // ── No token ─────────────────────────────────────────────────
  if (!token) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // ── Validate token ───────────────────────────────────────────
  try {
    const { payload } = await jwtVerify(token, secretKey)
    const role      = payload.role as string
    const homeRoute = ROLE_REDIRECT[role] ?? "/login"

    // Already authenticated → redirect away from /login
    if (isLoginPage) {
      return NextResponse.redirect(new URL(homeRoute, request.url))
    }

    // Protect routes — ensure role prefix matches the path
    if (isProtected) {
      const allowed = PREFIX_MAP[role] ?? "/nowhere"
      if (!pathname.startsWith(allowed)) {
        return NextResponse.redirect(new URL(homeRoute, request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid / expired token — clear cookie and redirect to login
    const response = isProtected
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next()
    response.cookies.delete(COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dept/:path*",
    "/student/:path*",
    "/login",
  ],
}
