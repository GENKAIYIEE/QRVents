"use client"

import { format } from "date-fns"
import { toast } from "sonner"
import { FileQuestion } from "lucide-react"

export function ProposalStatusOverview({
  pending,
  approved,
  rejected,
  recent,
  department,
}: {
  pending: number
  approved: number
  rejected: number
  recent: any[]
  department: any
}) {
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    toast("This feature is coming soon! 🚧")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100"
      case "APPROVED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100"
      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100"
      default:
        return "bg-slate-50 text-slate-600 border-slate-200"
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Proposal Status</h3>
        <p className="text-sm text-slate-500">Overview of event proposals</p>
      </div>

      <div className="p-6 pb-2">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100/50 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-amber-600 mb-0.5">{pending}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending</span>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100/50 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-emerald-600 mb-0.5">{approved}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Approved</span>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100/50 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-red-600 mb-0.5">{rejected}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Rejected</span>
          </div>
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recent Proposals</h4>
      </div>

      <div className="px-6 pb-6">
        {recent.length === 0 ? (
          <div className="py-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-lg">
            <FileQuestion className="text-slate-300 mb-2" size={24} />
            <p className="text-xs text-slate-500 font-medium">You have not submitted any event proposals yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((proposal) => (
              <div key={proposal.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 pr-4">
                  <div className="font-semibold text-sm text-slate-900 truncate mb-0.5">
                    {proposal.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(proposal.submittedAt), "MMMM d, yyyy")}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                  <a href="#" onClick={handleComingSoon} className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition-colors" title="Coming soon">
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
