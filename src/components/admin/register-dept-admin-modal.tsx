"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerDeptAdminSchema, RegisterDeptAdminFormValues } from "@/lib/validations/dept-admin"

interface RegisterDeptAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  departments: { id: string; name: string; code: string }[]
}

export function RegisterDeptAdminModal({ isOpen, onClose, onSuccess, departments }: RegisterDeptAdminModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterDeptAdminFormValues>({
    resolver: zodResolver(registerDeptAdminSchema),
  })

  if (!isOpen) return null

  const onSubmit = async (data: RegisterDeptAdminFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch("/api/admin/dept-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || "Something went wrong")
      }
      
      reset()
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Register Dept Admin</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
              {error}
            </div>
          )}
          
          <form id="register-admin-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                {...register("fullName")} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="E.g. Dr. John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email"
                {...register("email")} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="john.doe@pclu.edu.ph"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
              <select 
                {...register("departmentId")}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Department...</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
              {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password"
                {...register("password")} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Minimum 6 characters"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
              <input 
                type="password"
                {...register("confirmPassword")} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="register-admin-form"
            disabled={isSubmitting}
            className="px-5 py-2 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            Register Admin
          </button>
        </div>
      </div>
    </div>
  )
}
