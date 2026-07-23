"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Trash2, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react"
import { getStudents, deleteStudent, getDepartments } from "./actions"
import { format } from "date-fns"

interface Student {
  id: string
  fullName: string
  email: string
  studentId: string | null
  yearLevel: string | null
  section: string | null
  createdAt: Date
  department: {
    code: string
    name: string
    color: string
  } | null
}

export function StudentsClient() {
  const [students, setStudents] = useState<Student[]>([])
  const [departments, setDepartments] = useState<{id: string, name: string, code: string}[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Filters
  const [search, setSearch] = useState("")
  const [deptFilter, setDeptFilter] = useState("ALL")
  const [yearFilter, setYearFilter] = useState("ALL")
  const [sectionFilter, setSectionFilter] = useState("ALL")

  // Delete Modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getStudents(currentPage, 10, search, deptFilter, yearFilter, sectionFilter)
      setStudents(data.students as any[])
      setTotal(data.total)
      setPages(data.pages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search, deptFilter, yearFilter, sectionFilter])

  const fetchDepts = useCallback(async () => {
    try {
      const depts = await getDepartments()
      setDepartments(depts)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchDepts()
  }, [fetchDepts])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, deptFilter, yearFilter, sectionFilter])

  const handleDelete = async () => {
    if (!studentToDelete) return
    try {
      setIsDeleting(true)
      await deleteStudent(studentToDelete.id)
      setStudentToDelete(null)
      fetchStudents()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-full pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Accounts</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage registered students and accounts.</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm border border-blue-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">groups</span>
          Total Students: {total}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium flex items-center gap-2 border border-red-100">
          <ShieldAlert className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Course / Dept Filter */}
        <div className="relative min-w-[140px] w-full md:w-auto">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Courses</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">expand_more</span>
        </div>

        {/* Year Level Filter */}
        <div className="relative min-w-[120px] w-full md:w-auto">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="w-full px-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">expand_more</span>
        </div>

        {/* Section Filter */}
        <div className="relative min-w-[120px] w-full md:w-auto">
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full px-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            {(() => {
              const letters = ['A', 'B', 'C', 'D'];
              const years = yearFilter === 'ALL' ? ['1', '2', '3', '4'] : [yearFilter];
              return years.flatMap(y => 
                letters.map(l => (
                  <option key={`${y}${l}`} value={`${y}${l}`}>
                    {y}{l}
                  </option>
                ))
              );
            })()}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Yr & Sec</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined animate-spin text-blue-500 text-3xl">progress_activity</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{student.fullName}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{student.studentId || "No ID"} • {student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.department ? (
                        <span 
                          className="px-2.5 py-1 rounded-md text-xs font-bold border"
                          style={{ 
                            backgroundColor: student.department.color + '15',
                            color: student.department.color,
                            borderColor: student.department.color + '30'
                          }}
                        >
                          {student.department.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">
                          {student.yearLevel || "?"}
                        </span>
                        <span className="text-slate-400 font-medium">-</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold border border-slate-200">
                          {student.section || "?"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(new Date(student.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm font-medium text-slate-500">
              Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{pages}</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-50 transition-colors text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                disabled={currentPage === pages || isLoading}
                className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-50 transition-colors text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isDeleting && setStudentToDelete(null)} />
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete Student Account?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">{studentToDelete.fullName}</span>? This will permanently remove their account, attendance logs, and penalties. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
