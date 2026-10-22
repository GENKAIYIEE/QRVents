// Server-side Cloudflare Turnstile verification. The browser widget alone proves nothing:
// every login/register entry point must call verifyTurnstile before touching the database.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// Cloudflare's published "always passes" test secret. Only used outside production so a
// missing key can never silently weaken the live system.
const DEV_TEST_SECRET = "1x0000000000000000000000000000000AA"

// Turnstile tokens are documented to be at most 2048 characters.
const MAX_TOKEN_LENGTH = 2048

export type CaptchaResult = { ok: true } | { ok: false; error: string }

type SiteverifyResponse = {
  success?: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<CaptchaResult> {
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, error: "Please complete the security check." }
  }

  const secret =
    process.env.TURNSTILE_SECRET_KEY ||
    (process.env.NODE_ENV !== "production" ? DEV_TEST_SECRET : undefined)

  // Fail closed: without a secret we cannot tell humans from bots.
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set; blocking request.")
    return {
      ok: false,
      error: "The security check is unavailable right now. Please contact your administrator.",
    }
  }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set("remoteip", remoteIp)

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`Siteverify responded with HTTP ${res.status}`)

    const data = (await res.json()) as SiteverifyResponse
    if (data.success) return { ok: true }

    console.warn("Turnstile rejected a token:", data["error-codes"] ?? [])
    return { ok: false, error: "Security check failed. Please try again." }
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return { ok: false, error: "We couldn't verify the security check. Please try again." }
  }
}

// Best-effort client IP so Cloudflare can factor it into its decision. Optional by design.
export function getClientIp(headers: { get(name: string): string | null }): string | null {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null
  )
}
