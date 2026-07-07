"use client"

import { useState, useEffect } from "react"
import { RegisterDeptAdminModal } from "@/components/admin/register-dept-admin-modal"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"

interface ResetPasswordModalProps {
  adminId: string
  adminName: string
  onClose: () => void
  onSuccess: () => void
}

function ResetPasswordModal({ adminId, adminName, onClose, onSuccess }: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/dept-admins/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", newPassword }),
      })
      if (res.ok) {
        toast.success(`Password reset for ${adminName}`)
        onSuccess()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to reset password")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95">
        <h3 className="text-lg font-bold text-slate-800 mb-1">Reset Password</h3>
        <p className="text-slate-500 text-sm mb-5">
          Set a new password for <span className="font-semibold text-slate-700">{adminName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
              Reset Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function DeptAdminsClient({ departments }: { departments: any[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null)
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [departmentId, setDepartmentId] = useState<string>(searchParams.get("departmentId") || "ALL")
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams()
      query.set("page", page.toString())
      if (search) query.set("search", search)
      if (departmentId !== "ALL") query.set("departmentId", departmentId)

      const res = await fetch(`/api/admin/dept-admins?${query.toString()}`)
      const { data } = await res.json()
      
      setAdmins(data.admins || [])
      setTotalPages(data.pages || 1)

      router.replace(`${pathname}?${query.toString()}`, { scroll: false })
    } catch {
      toast.error("Failed to load administrators")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [page, search, departmentId])

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? "deactivate" : "reactivate"
    const confirmed = window.confirm(`Are you sure you want to ${action} ${name}?`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/admin/dept-admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", isActive: !currentStatus })
      })
      if (res.ok) {
        toast.success(`Admin ${currentStatus ? "deactivated" : "reactivated"} successfully`)
        fetchAdmins()
      } else {
        toast.error("Failed to update admin status")
      }
    } catch {
      toast.error("An unexpected error occurred")
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex-1 w-full relative lg:max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-medium"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          <select 
            value={departmentId}
            onChange={(e) => { setDepartmentId(e.target.value); setPage(1) }}
            className="w-full sm:w-[180px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-700 text-sm"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1]">person_add</span>
            Register Admin
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">progress_activity</span>
        </div>
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">group_off</span>
          <h3 className="text-lg font-bold text-slate-700">No administrators found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or register a new admin.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className={`hover:bg-slate-50/80 transition-colors ${!admin.isActive ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                          {admin.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{admin.fullName}</div>
                          <div className="text-xs text-slate-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.department ? (
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: admin.department.color }}
                          />
                          <span className="font-medium text-slate-700">{admin.department.code}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{format(new Date(admin.createdAt), "MMM d, yyyy")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        admin.isActive 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setResetTarget({ id: admin.id, name: admin.fullName })}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1"
                          title="Reset Password"
                        >
                          <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                          Reset
                        </button>
                        
                        <button 
                          onClick={() => handleToggleStatus(admin.id, admin.fullName, admin.isActive)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            admin.isActive 
                              ? 'text-rose-500 hover:bg-rose-50 border border-transparent' 
                              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100'
                          }`}
                          title={admin.isActive ? "Deactivate Account" : "Reactivate Account"}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {admin.isActive ? 'block' : 'check_circle'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-white transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Prev
              </button>
              <div className="px-4 py-2 font-bold text-slate-500 text-sm bg-white border border-slate-100 rounded-lg shadow-sm">
                {page} <span className="text-slate-300 mx-1">/</span> {totalPages}
              </div>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-5 py-2.5 rounded-xl border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-slate-600 hover:bg-white transition-colors shadow-sm text-sm flex items-center gap-1"
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}

      <RegisterDeptAdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          fetchAdmins()
        }}
        departments={departments}
      />

      {resetTarget && (
        <ResetPasswordModal
          adminId={resetTarget.id}
          adminName={resetTarget.name}
          onClose={() => setResetTarget(null)}
          onSuccess={fetchAdmins}
        />
      )}
    </div>
  )
}
