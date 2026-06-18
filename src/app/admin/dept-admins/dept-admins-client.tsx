"use client"

import { useState, useEffect } from "react"
import { RegisterDeptAdminModal } from "@/components/admin/register-dept-admin-modal"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { format } from "date-fns"

export function DeptAdminsClient({ departments }: { departments: any[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
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
    } catch (err) {
      console.error("Failed to fetch admins", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [page, search, departmentId])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'reactivate'} this admin?`)) return

    try {
      const res = await fetch(`/api/admin/dept-admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", isActive: !currentStatus })
      })
      if (res.ok) fetchAdmins()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt("Enter new password (min 6 characters):")
    if (!newPassword) return
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    try {
      const res = await fetch(`/api/admin/dept-admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", newPassword })
      })
      if (res.ok) {
        alert("Password reset successfully")
      } else {
        const err = await res.json()
        alert(err.error || "Failed to reset password")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-blue-600 text-sm [font-variation-settings:'FILL'_1]">home</span>
            <span className="text-slate-300 text-xs font-bold">/</span>
            <span className="text-blue-600/80 text-[10px] font-extrabold uppercase tracking-widest">Dept Admins</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">Department Admins</h1>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px] [font-variation-settings:'FILL'_1]">person_add</span>
          Register Admin
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-64">
          <select 
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
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
                          onClick={() => handleResetPassword(admin.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1"
                          title="Reset Password"
                        >
                          <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                          Reset
                        </button>
                        
                        <button 
                          onClick={() => handleToggleStatus(admin.id, admin.isActive)}
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
    </div>
  )
}
