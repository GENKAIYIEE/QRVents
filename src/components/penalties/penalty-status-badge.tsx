import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WAIVED: "bg-gray-100 text-gray-600 border-gray-200",
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  OVERDUE: "Overdue",
  RESOLVED: "Resolved",
  WAIVED: "Waived",
}

export function PenaltyStatusBadge({
  status,
}: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      STATUS_STYLES[status]
    )}>
      {STATUS_LABELS[status]}
    </span>
  )
}
