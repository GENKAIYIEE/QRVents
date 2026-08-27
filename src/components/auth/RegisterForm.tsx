"use client"

import { useState } from "react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction } from "@/app/(auth)/register/actions"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/register"
import { toast } from "sonner"
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
  IdCard,
  Check,
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
    watch,
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
      section: "",
      studentId: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    const result = await registerAction(values)
    if (result?.error) {
      setServerError(result.error)
    } else {
      toast.success("Account has been successfully created!")
    }
  }

  const passwordValue = watch("password") || ""
  const yearLevelValue = watch("yearLevel")
  
  const passwordRequirements = [
    { label: "Minimum of 8 characters", met: passwordValue.length >= 8 },
    { label: "Uppercase & lowercase letters", met: /[a-z]/.test(passwordValue) && /[A-Z]/.test(passwordValue) },
    { label: "Numbers", met: /\d/.test(passwordValue) },
    { label: "Special characters", met: /[^A-Za-z0-9]/.test(passwordValue) },
  ]
  
  const metCount = passwordRequirements.filter((r) => r.met).length
  let strengthLabel = "Weak"
  let strengthColor = "bg-red-500"

  if (passwordValue.length === 0) {
    strengthLabel = ""
    strengthColor = "bg-slate-200"
  } else if (metCount >= 4) {
    strengthLabel = "Strong"
    strengthColor = "bg-emerald-500"
  } else if (metCount >= 3) {
    strengthLabel = "Medium"
    strengthColor = "bg-amber-500"
  } else {
    strengthLabel = "Weak"
    strengthColor = "bg-red-500"
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
        <div className="w-full md:w-7/12 bg-white flex flex-col justify-center p-6 sm:p-10 lg:p-14 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-xl mx-auto my-auto py-8">
            {/* Mobile logo */}
            <div className="flex md:hidden items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                <img src="/Pclu-Logo.png" alt="PCLU Logo" className="w-[114%] h-[114%] max-w-none object-cover -translate-y-1" />
              </div>
              <span className="font-bold text-[#0F172A] text-xl">QRVents</span>
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

              <div className="grid grid-cols-1 gap-5">
                {/* Student ID Field */}
                <div>
                  <label htmlFor="studentId" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Student ID
                  </label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="studentId"
                      type="text"
                      placeholder="e.g. 2021-12345"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("studentId")}
                    />
                  </div>
                  {errors.studentId && <p className="text-red-500 text-xs mt-1.5">{errors.studentId.message}</p>}
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

                {/* Section Field */}
                <div>
                  <label htmlFor="section" className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Section
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    <input
                      id="section"
                      type="text"
                      placeholder="e.g. A"
                      className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm hover:border-slate-300"
                      {...register("section")}
                    />
                  </div>
                  {errors.section && <p className="text-red-500 text-xs mt-1.5">{errors.section.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                {/* Password Field */}
                <div className="flex flex-col">
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
                  
                  {/* Password Strength Indicator */}
                  {passwordValue.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[#475569] font-medium">Password strength</span>
                        <span className={`font-semibold ${
                          strengthLabel === "Strong" ? "text-emerald-600" :
                          strengthLabel === "Medium" ? "text-amber-600" : "text-red-600"
                        }`}>{strengthLabel}</span>
                      </div>
                      <div className="flex h-1.5 w-full gap-1.5">
                        <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${passwordValue.length > 0 ? (metCount >= 1 ? strengthColor : "bg-red-500") : "bg-slate-200"}`} />
                        <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${metCount >= 3 ? strengthColor : "bg-slate-200"}`} />
                        <div className={`h-full flex-1 rounded-full transition-colors duration-300 ${metCount >= 4 ? strengthColor : "bg-slate-200"}`} />
                      </div>
                      
                      <div className="flex flex-col gap-y-2 mt-2">
                        {passwordRequirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {req.met ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              </div>
                            )}
                            <span className={`text-[11px] leading-tight ${req.met ? "text-slate-700" : "text-slate-500"}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col">
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
