"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction } from "@/app/(auth)/register/actions"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/register"
import {
  Mail,
  Lock,
  User,
  Building2,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  QrCode,
  ScanLine,
  BarChart2,
  Shield,
} from "lucide-react"

type Department = {
  id: string
  name: string
  code: string
}

type RegisterFormProps = {
  departments: Department[]
}

export default function RegisterForm({ departments }: RegisterFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      departmentId: "",
      yearLevel: undefined,
    },
    mode: "onChange",
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    const result = await registerAction(values)
    if (result?.error) {
      setServerError(result.error)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white">
      {/* Main Container */}
      <div className="w-full h-full flex flex-col md:flex-row">
        
        {/* ── LEFT PANEL ── */}
        <div className="hidden md:flex w-full md:w-5/12 bg-[#0F1E45] flex-col justify-between p-10 lg:p-14 relative overflow-hidden shrink-0">
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
              Create your<br />
              <span className="text-blue-400">Student Account.</span>
            </h1>
            <p className="text-blue-200/60 text-base leading-relaxed max-w-xs mt-5">
              Register once to get your permanent QR code for all campus events.
            </p>
            <div className="w-12 h-0.5 bg-blue-500/40 mt-8" />

            {/* Feature List */}
            <div className="mt-6 flex flex-col gap-3">
              {[
                { icon: <QrCode className="text-blue-400" size={14} />, text: "Permanent QR per student" },
                { icon: <ScanLine className="text-blue-400" size={14} />, text: "Instant QR check-in & out" },
                { icon: <BarChart2 className="text-blue-400" size={14} />, text: "Track your attendance history" },
                { icon: <Shield className="text-blue-400" size={14} />, text: "Secure role-based access" },
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
        <div className="w-full md:w-7/12 bg-white flex flex-col justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-xl mx-auto my-auto py-8">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-[#1A3A8F] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QR</span>
              </div>
              <span className="font-bold text-[#0F172A] text-lg">QRVents</span>
            </div>

            {/* Form Header */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide uppercase">
                Student Portal Access
              </span>
            </div>

            <h2 className="text-[#0F172A] text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="text-[#475569] text-sm leading-relaxed mt-2">
              Fill in your details to register. Your permanent QR code will be generated instantly.
            </p>

            {/* Error Banner */}
            {serverError && (
              <div className="mt-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm leading-snug">{serverError}</p>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5" noValidate>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("fullName")}
                      required
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      placeholder="juan@gmail.com"
                      autoComplete="email"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("email")}
                      required
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Department Field */}
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <select
                      id="departmentId"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300 appearance-none"
                      {...register("departmentId")}
                    >
                      <option value="" disabled>Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.code}</option>
                      ))}
                    </select>
                  </div>
                  {errors.departmentId && <p className="text-red-500 text-xs mt-1.5">{errors.departmentId.message}</p>}
                </div>

                {/* Year Level Field */}
                <div>
                  <label htmlFor="yearLevel" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Year Level
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <select
                      id="yearLevel"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300 appearance-none"
                      {...register("yearLevel")}
                    >
                      <option value="" disabled>Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  {errors.yearLevel && <p className="text-red-500 text-xs mt-1.5">{errors.yearLevel.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      autoComplete="new-password"
                      className="w-full h-12 pl-11 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("password")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      className="w-full h-12 pl-11 pr-10 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("confirmPassword")}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 mt-2 bg-gradient-to-r from-[#1A3A8F] to-blue-600 hover:from-[#15307A] hover:to-blue-700 active:from-[#0F2460] active:to-blue-800 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(26,58,143,0.3)] hover:shadow-[0_12px_24px_-6px_rgba(26,58,143,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account & Get My QR Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-8">
              <div className="flex-1 h-px bg-[#F1F5F9]" />
              <span className="text-[#94A3B8] text-xs">or</span>
              <div className="flex-1 h-px bg-[#F1F5F9]" />
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-[#475569]">
              Already have an account?{" "}
              <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign in
              </a>
            </p>


          </div>
        </div>

      </div>
    </div>
  )
}
