import { formatDistanceToNow } from "date-fns"
import { UserPlus, Calendar, Send, Activity, Info } from "lucide-react"

export function RecentActivityFeed({
  activities,
  department,
}: {
  activities: any[]
  department: any
}) {
  const getActionIcon = (action: string) => {
    const act = action.toLowerCase()
    if (act.includes("register") || act.includes("student") || act.includes("user")) {
      return <UserPlus size={16} />
    }
    if (act.includes("event")) {
      return <Calendar size={16} />
    }
    if (act.includes("propos")) {
      return <Send size={16} />
    }
    return <Info size={16} />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
        <Activity className="text-slate-400" size={20} />
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Activity</h3>
      </div>

      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No recent activity in your department yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative pl-6">
                <div 
                  className="absolute -left-[13px] top-0 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center"
                  style={{ backgroundColor: department.color, color: "white" }}
                >
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-slate-800">
                    {activity.userName} <span className="font-normal text-slate-500">{activity.action}</span>
                  </div>
                  {activity.details && (
                    <div className="text-xs text-slate-500 mt-1">{activity.details}</div>
                  )}
                  <div className="text-[11px] font-semibold text-slate-400 mt-1.5 uppercase tracking-wider">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
