"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { loginAction } from "@/app/(auth)/login/actions"
import { toast } from "sonner"
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("registered") === "true") {
      toast.success("Account has been successfully created!")
      // Clean up URL without triggering a reload
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

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

          {/* Branding Centered */}
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
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-10 lg:p-14">
          <div className="w-full max-w-sm mx-auto">

            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-[2px]" />
              </div>
              <span className="font-bold text-[#0F172A] text-xl">QRVents</span>
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
                  Email
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
