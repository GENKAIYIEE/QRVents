"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import prisma from "@/lib/prisma"
import { comparePassword } from "@/lib/auth"
import { COOKIE_NAME } from "@/lib/constants"

type LoginActionResult = {
  error?: string
}

const ROLE_REDIRECT: Record<string, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  DEPT_ADMIN:  "/dept/dashboard",
  STUDENT:     "/student/dashboard",
}

export async function loginAction(
  email: string,
  password: string
): Promise<LoginActionResult> {
  // Step 1 & 2 — Database lookup
  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: true },
  })

  if (!user) {
    return { error: "Invalid email or password" }
  }

  // Step 3 — Password verification
  const passwordMatch = await comparePassword(password, user.passwordHash)

  if (!passwordMatch) {
    return { error: "Invalid email or password" }
  }

  // Step 4 — Active status check
  if (user.isActive === false) {
    return {
      error: "Your account has been deactivated. Contact your administrator.",
    }
  }

  // Step 5 — Token generation (must match SessionPayload in types/index.ts)
  const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

  const token = await new SignJWT({
    userId: user.id,
    role: user.role,
    email: user.email,
    fullName: user.fullName,
    departmentId: user.departmentId ?? null,
    departmentCode: user.department?.code ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(secretKey)

  // Step 6 — Set cookie using the shared COOKIE_NAME constant
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  // Step 7 — Redirect by role
  const destination = ROLE_REDIRECT[user.role] ?? "/login"
  redirect(destination)
}
