"use client"

import { format } from "date-fns"
import { toast } from "sonner"
import { Users } from "lucide-react"

export function StudentOverviewTable({
  students,
  totalCount,
  department,
}: {
  students: any[]
  totalCount: number
  department: any
}) {
  const handleComingSoon = () => {
    toast("Full student list coming soon! 🚧")
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Students</h3>
          <p className="text-sm text-slate-500">Newly registered in {department.name}</p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: department.lightBg }}
        >
          <Users size={20} style={{ color: department.color }} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Full Name</th>
              <th className="px-6 py-4 font-semibold">Year Level</th>
              <th className="px-6 py-4 font-semibold">School Email</th>
              <th className="px-6 py-4 font-semibold text-right">Date Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  No students registered in this department yet.
                </td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    {student.fullName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                    {student.yearLevel || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{student.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-right whitespace-nowrap">
                    {format(new Date(student.createdAt), "MMMM d, yyyy")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{students.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{totalCount}</span> students in {department.code}
        </div>
        <button
          onClick={handleComingSoon}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors border hover:shadow-sm"
          style={{ 
            color: department.color, 
            borderColor: `${department.color}30`,
            backgroundColor: "white" 
          }}
        >
          View All Students
        </button>
      </div>
    </div>
  )
}
