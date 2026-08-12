"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react"

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [countdown, setCountdown] = useState(5)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const newPasswordValue = watch("newPassword")

  // ── Extract token from URL on mount ─────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get("token")
    if (!t) {
      setTokenError("No reset token found. Please use the link from your email.")
    } else {
      setToken(t)
    }
  }, [])

  // ── Auto-redirect after success ──────────────────────────────────────────────
  useEffect(() => {
    if (!success) return
    if (countdown <= 0) {
      window.location.href = "/login"
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [success, countdown])

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) return
    setServerError(null)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: values.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setSuccess(true)
    } catch {
      setServerError("Network error. Please check your connection and try again.")
    }
  }

  // ── Password strength indicator ──────────────────────────────────────────────
  const getStrength = (pw: string) => {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }

  const strength = getStrength(newPasswordValue ?? "")
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"]

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      <div className="w-full h-full flex flex-col md:flex-row">

        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#0F1E45] flex-col justify-between p-10 lg:p-14 relative overflow-hidden">
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
                { icon: "🔑", text: "Create a strong new password" },
                { icon: "✅", text: "Used only once — link expires after" },
                { icon: "🔒", text: "Stored securely with bcrypt hashing" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-blue-100/80 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-10 lg:p-14">
          <div className="w-full max-w-sm mx-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-[2px]" />
              </div>
              <span className="font-bold text-[#0F172A] text-xl">QRVents</span>
            </div>

            {/* ── Token error (no token in URL) ── */}
            {tokenError && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight mb-3">Invalid Link</h2>
                <p className="text-[#475569] text-sm leading-relaxed mb-8">{tokenError}</p>
                <a
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 text-white font-bold text-sm rounded-xl px-6 py-3 transition-all hover:-translate-y-0.5"
                >
                  Request New Reset Link
                </a>
              </div>
            )}

            {/* ── Success state ── */}
            {success && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-[#0F172A] text-2xl font-bold tracking-tight mb-3">Password Reset!</h2>
                <p className="text-[#475569] text-sm leading-relaxed mb-2">
                  Your password has been updated successfully.
                </p>
                <p className="text-[#94A3B8] text-sm mb-8">
                  Redirecting to login in <strong className="text-blue-600">{countdown}s</strong>...
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 text-white font-bold text-sm rounded-xl px-6 py-3 transition-all hover:-translate-y-0.5"
                >
                  Sign In Now
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* ── Form ── */}
            {!tokenError && !success && (
              <>
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">
                    Set New Password
                  </span>
                </div>

                <h2 className="text-[#0F172A] text-3xl font-bold tracking-tight">Create New Password</h2>
                <p className="text-[#475569] text-sm leading-relaxed mt-2">
                  Your new password must be at least 8 characters. Choose something strong and memorable.
                </p>

                {/* Server error */}
                {serverError && (
                  <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 text-sm leading-snug">{serverError}</p>
                      {(serverError.includes("expired") || serverError.includes("invalid") || serverError.includes("used")) && (
                        <a href="/forgot-password" className="text-red-600 text-xs font-semibold hover:underline mt-1 inline-block">
                          Request a new reset link →
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
                  {/* New Password */}
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-semibold text-[#0F172A] mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                      <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        autoFocus
                        className="w-full h-12 pl-11 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                        {...register("newPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength bar */}
                    {newPasswordValue && newPasswordValue.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="h-1.5 flex-1 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: i <= strength ? strengthColors[strength] : "#E2E8F0",
                              }}
                            />
                          ))}
                        </div>
                        {strength > 0 && (
                          <p className="text-xs mt-1 font-medium" style={{ color: strengthColors[strength] }}>
                            {strengthLabels[strength]}
                          </p>
                        )}
                      </div>
                    )}

                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                      <input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                        className="w-full h-12 pl-11 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    id="reset-password-submit"
                    disabled={isSubmitting}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 active:from-[#0F2460] active:to-blue-800 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <a href="/login" className="text-sm text-[#475569] hover:text-blue-600 transition-colors font-medium">
                    Back to Sign In
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
