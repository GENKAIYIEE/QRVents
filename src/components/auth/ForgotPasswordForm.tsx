"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle,
  KeyRound, ShieldCheck, Lock, Eye, EyeOff, RefreshCw,
} from "lucide-react"

// ─── Schemas ──────────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Please enter a valid email address."),
})
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters.").max(128),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type EmailValues = z.infer<typeof emailSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type Step = "email" | "otp" | "password" | "success"

// ─── Password Strength ───────────────────────────────────────────────────────
function getStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"]
const STRENGTH_COLORS = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"]

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div className="hidden md:flex w-full md:w-1/2 bg-[#0F1E45] flex-col p-10 lg:p-14 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-600/10" />
      <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-blue-400/5" />
      <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-blue-500/10" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center -mt-10">
        <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 flex items-center justify-center mb-6 shadow-2xl ring-4 ring-white/10 bg-white">
          <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-1" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-4xl leading-none tracking-tight">QRVents</p>
          <p className="text-blue-300/80 text-sm font-semibold tracking-widest uppercase mt-3">
            Polytechnic College of La Union
          </p>
        </div>
        <div className="mt-12 w-full max-w-xs space-y-3">
          {[
            { icon: "📧", text: "OTP sent to your registered email" },
            { icon: "⏱️", text: "Code expires in 10 minutes" },
            { icon: "🔒", text: "One-time use — cannot be reused" },
            { icon: "🛡️", text: "Password hashed securely with bcrypt" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-blue-100/80 text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── OTP Input (6 individual boxes) ──────────────────────────────────────────
function OtpInput({ value, onChange, disabled }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1)
    const arr = value.split("")
    arr[idx] = digit
    const next = arr.join("").padEnd(6, "").slice(0, 6)
    onChange(next.trimEnd())
    if (digit && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!value[idx] && idx > 0) {
        const arr = value.split("")
        arr[idx - 1] = ""
        onChange(arr.join("").trimEnd())
        inputs.current[idx - 1]?.focus()
      } else {
        const arr = value.split("")
        arr[idx] = ""
        onChange(arr.join("").trimEnd())
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center my-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`
            w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
            bg-slate-50 text-slate-900 outline-none transition-all duration-200
            focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
            disabled:opacity-50 disabled:cursor-not-allowed
            ${value[i] ? "border-blue-400 bg-blue-50/50" : "border-slate-200"}
          `}
        />
      ))}
    </div>
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function Countdown({ expiresAt, onExpired }: { expiresAt: Date; onExpired: () => void }) {
  const [remaining, setRemaining] = useState(
    Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setRemaining(r)
      if (r === 0) { clearInterval(interval); onExpired() }
    }, 1000)
    return () => clearInterval(interval)
  }, [expiresAt, onExpired])

  const mins = Math.floor(remaining / 60).toString().padStart(2, "0")
  const secs = (remaining % 60).toString().padStart(2, "0")
  const isUrgent = remaining <= 60

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isUrgent ? "text-red-500" : "text-slate-500"}`}>
      <span className={`w-2 h-2 rounded-full ${isUrgent ? "bg-red-500 animate-pulse" : "bg-green-500"}`} />
      {mins}:{secs} remaining
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("email")
  const [sessionToken, setSessionToken] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [otpExpired, setOtpExpired] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const [otpError, setOtpError] = useState<string | null>(null)
  const [otpLoading, setOtpLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendEmail, setResendEmail] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  // ── Email form ──────────────────────────────────────────────────────────────
  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  // ── Password form ───────────────────────────────────────────────────────────
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })
  const pwValue = passwordForm.watch("newPassword")
  const strength = getStrength(pwValue ?? "")

  // ── Success redirect countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== "success") return
    if (redirectCountdown <= 0) { window.location.href = "/login"; return }
    const t = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [step, redirectCountdown])

  // ── Resend cooldown ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // ── Step 1: Submit email ─────────────────────────────────────────────────────
  const onEmailSubmit = async (values: EmailValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        setServerError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setResendEmail(values.email)
      setSessionToken(data.token)
      setExpiresAt(new Date(Date.now() + 10 * 60 * 1000))
      setOtpExpired(false)
      setOtpValue("")
      setStep("otp")
    } catch {
      setServerError("Network error. Please check your connection.")
    }
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────────
  const onOtpSubmit = async () => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter all 6 digits.")
      return
    }
    setOtpError(null)
    setOtpLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, otp: otpValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error ?? "Invalid OTP. Please try again.")
        return
      }
      setStep("password")
    } catch {
      setOtpError("Network error. Please try again.")
    } finally {
      setOtpLoading(false)
    }
  }

  // ── Resend OTP ───────────────────────────────────────────────────────────────
  const onResend = useCallback(async () => {
    if (resendCooldown > 0) return
    setResendLoading(true)
    setOtpError(null)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      })
      const data = await res.json()
      if (data.token) {
        setSessionToken(data.token)
        setExpiresAt(new Date(Date.now() + 10 * 60 * 1000))
        setOtpExpired(false)
        setOtpValue("")
        setResendCooldown(60)
      }
    } catch {
      setOtpError("Failed to resend. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }, [resendEmail, resendCooldown])

  // ── Step 3: Reset password ───────────────────────────────────────────────────
  const onPasswordSubmit = async (values: PasswordValues) => {
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: sessionToken, newPassword: values.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong.")
        return
      }
      setStep("success")
    } catch {
      setServerError("Network error. Please try again.")
    }
  }

  // ── Step indicator ────────────────────────────────────────────────────────────
  const steps = [
    { label: "Email", num: 1 },
    { label: "OTP", num: 2 },
    { label: "Password", num: 3 },
  ]
  const currentStep = step === "email" ? 1 : step === "otp" ? 2 : step === "password" ? 3 : 4

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      <div className="w-full h-full flex flex-col md:flex-row">
        <LeftPanel />

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-10 lg:p-14 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-[2px]" />
              </div>
              <span className="font-bold text-[#0F172A] text-lg">QRVents</span>
            </div>

            {/* Step indicator (hidden on success) */}
            {step !== "success" && (
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                      ${currentStep > s.num
                        ? "bg-green-500 text-white"
                        : currentStep === s.num
                          ? "bg-[#1A3A8F] text-white"
                          : "bg-slate-100 text-slate-400"
                      }
                    `}>
                      {currentStep > s.num ? "✓" : s.num}
                    </div>
                    <span className={`text-xs font-medium ${currentStep === s.num ? "text-[#0F172A]" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-px w-6 ${currentStep > s.num ? "bg-green-400" : "bg-slate-200"}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ──────────────── STEP 1: EMAIL ─────────────────── */}
            {step === "email" && (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                  <KeyRound className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">Password Recovery</span>
                </div>
                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight">Forgot Password?</h2>
                <p className="text-[#475569] text-sm leading-relaxed mt-2 mb-6">
                  Enter your registered email and we&apos;ll send you a <strong>6-digit OTP</strong> to reset your password.
                </p>

                {serverError && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-5" noValidate>
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        placeholder="yourname@email.com"
                        className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        {...emailForm.register("email")}
                      />
                    </div>
                    {emailForm.formState.errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="send-otp-submit"
                    disabled={emailForm.formState.isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {emailForm.formState.isSubmitting ? (
                      <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending OTP...</>
                    ) : (
                      <>Send OTP <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <a href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-blue-600 transition-colors font-medium">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </a>
                </div>
              </>
            )}

            {/* ──────────────── STEP 2: OTP ─────────────────── */}
            {step === "otp" && (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">Enter OTP</span>
                </div>

                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight">Check Your Email</h2>
                <p className="text-[#475569] text-sm leading-relaxed mt-2">
                  We sent a <strong>6-digit OTP</strong> to <span className="font-semibold text-blue-600">{resendEmail}</span>. Enter it below.
                </p>

                {/* Countdown */}
                <div className="mt-4 flex items-center justify-between">
                  {expiresAt && !otpExpired ? (
                    <Countdown expiresAt={expiresAt} onExpired={() => setOtpExpired(true)} />
                  ) : (
                    <span className="text-red-500 text-sm font-semibold">⚠️ OTP expired</span>
                  )}

                  {/* Resend button */}
                  <button
                    onClick={onResend}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${resendLoading ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>

                {/* OTP Input */}
                <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  disabled={otpLoading || otpExpired}
                />

                {otpError && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{otpError}</p>
                  </div>
                )}

                <button
                  id="verify-otp-submit"
                  onClick={onOtpSubmit}
                  disabled={otpLoading || otpExpired || otpValue.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Verifying...</>
                  ) : (
                    <>Verify OTP <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => { setStep("email"); setOtpValue(""); setOtpError(null) }}
                    className="inline-flex items-center gap-1.5 text-sm text-[#475569] hover:text-blue-600 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
                  </button>
                </div>
              </>
            )}

            {/* ──────────────── STEP 3: NEW PASSWORD ─────────────────── */}
            {step === "password" && (
              <>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-6">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 text-xs font-semibold tracking-wide uppercase">OTP Verified</span>
                </div>

                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight">Set New Password</h2>
                <p className="text-[#475569] text-sm leading-relaxed mt-2 mb-6">
                  Create a strong new password. Minimum 8 characters.
                </p>

                {serverError && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-5" noValidate>
                  {/* New Password */}
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-semibold text-[#0F172A] mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                      <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Minimum 8 characters"
                        className="w-full h-12 pl-11 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        {...passwordForm.register("newPassword")}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwValue && pwValue.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{ backgroundColor: i <= strength ? STRENGTH_COLORS[strength] : "#E2E8F0" }} />
                          ))}
                        </div>
                        {strength > 0 && <p className="text-xs mt-1 font-medium" style={{ color: STRENGTH_COLORS[strength] }}>{STRENGTH_LABELS[strength]}</p>}
                      </div>
                    )}
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#0F172A] mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                      <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        className="w-full h-12 pl-11 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        {...passwordForm.register("confirmPassword")}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-1">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1.5">{passwordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="reset-password-submit"
                    disabled={passwordForm.formState.isSubmitting}
                    className="w-full h-12 mt-1 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {passwordForm.formState.isSubmitting ? (
                      <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                    ) : (
                      <>Reset Password <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* ──────────────── STEP 4: SUCCESS ─────────────────── */}
            {step === "success" && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight mb-3">Password Reset!</h2>
                <p className="text-[#475569] text-sm leading-relaxed mb-2">
                  Your password has been updated successfully.
                </p>
                <p className="text-[#94A3B8] text-sm mb-8">
                  Redirecting to login in <strong className="text-blue-600">{redirectCountdown}s</strong>...
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 text-white font-bold text-sm rounded-xl px-6 py-3 transition-all hover:-translate-y-0.5"
                >
                  Sign In Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
