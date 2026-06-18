"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { loginAction } from "@/app/(auth)/login/actions"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  QrCode,
  ScanLine,
  BarChart2,
  Shield,
} from "lucide-react"

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    const result = await loginAction(values.email, values.password)
    if (result?.error) {
      setServerError(result.error)
    } else if (result?.redirectTo) {
      window.location.href = result.redirectTo
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Main Container */}
      <div className="w-full h-full flex flex-col md:flex-row">
        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-full md:w-1/2 bg-[#0F1E45] flex-col justify-between p-10 lg:p-14 relative overflow-hidden">

          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-600/10" />
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-blue-400/5" />
          <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full bg-blue-500/10" />

          {/* Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <span className="text-white font-bold text-lg">QR</span>
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-none tracking-tight">QRVents</p>
                <p className="text-blue-300/70 text-xs font-medium tracking-widest uppercase mt-1">
                  Polytechnic College of La Union
                </p>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
            <h1 className="text-white text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              Smart Events.<br />
              <span className="text-blue-400">Instant Attendance.</span>
            </h1>
            <p className="text-blue-200/60 text-base leading-relaxed max-w-xs mt-5">
              One permanent QR code per student. Used at every event, forever.
            </p>
            <div className="w-12 h-0.5 bg-blue-500/40 mt-8" />

            {/* Feature List */}
            <div className="mt-6 flex flex-col gap-3">
              {[
                { icon: <QrCode className="text-blue-400" size={14} />, text: "Permanent QR per student" },
                { icon: <ScanLine className="text-blue-400" size={14} />, text: "Instant QR check-in & out" },
                { icon: <BarChart2 className="text-blue-400" size={14} />, text: "Real-time attendance reports" },
                { icon: <Shield className="text-blue-400" size={14} />, text: "Role-based secure access" },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {feature.icon}
                  </div>
                  <span className="text-blue-100/70 text-sm">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="relative z-10">
            <div className="w-full h-px bg-white/5 mb-6" />
            <div className="flex gap-8">
              {[
                { number: "7", label: "Departments" },
                { number: "3", label: "Portals" },
                { number: "∞", label: "Events" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-white font-bold text-2xl leading-none">{stat.number}</p>
                  <p className="text-blue-300/50 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-10 lg:p-14">
          <div className="w-full max-w-sm mx-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-[#1A3A8F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QR</span>
              </div>
              <span className="font-bold text-[#0F172A] text-lg">QRVents</span>
            </div>

            {/* Form Header */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">
                Secure Portal Access
              </span>
            </div>

            <h2 className="text-[#0F172A] text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-[#475569] text-sm leading-relaxed mt-2">
              Sign in to access your QRVents portal. The system will route you to the correct dashboard automatically.
            </p>

            {/* Error Banner */}
            {serverError && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm leading-snug">{serverError}</p>
              </div>
            )}

            {/* Login Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-8 flex flex-col gap-5"
              noValidate
            >
              {/* Email Field */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  School Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="yourname@email.com"
                    autoComplete="email"
                    className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    {...register("email")}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="login-password"
                    className="text-sm font-semibold text-[#0F172A]"
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-12 pl-11 pr-12 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                    {...register("password")}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 active:from-[#0F2460] active:to-blue-800 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to QRVents
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 h-px bg-[#F1F5F9]" />
              <span className="text-[#94A3B8] text-xs">or</span>
              <div className="flex-1 h-px bg-[#F1F5F9]" />
            </div>

            {/* Register Link */}
            <p className="mt-5 text-center text-sm text-[#475569]">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Register here
              </a>
            </p>


          </div>
        </div>
      </div>
    </div>
  )
}
