"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, CheckCircle2, Info, AlertCircle, Bell } from "lucide-react"
import { markNotificationAsRead, markAllNotificationsAsRead } from "./actions"
import { toast } from "sonner"

export function NotificationsClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (e) {
      toast.error("Failed to mark as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (e) {
      toast.error("Failed to mark all as read")
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "PROPOSAL": return <Info className="w-5 h-5 text-blue-500" />
      case "APPROVED": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      case "REJECTED": return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          Unread <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-2xl border flex gap-4 transition-all ${
                n.isRead ? "bg-white border-slate-100" : "bg-blue-50 border-blue-200 shadow-sm"
              }`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm ${n.isRead ? "text-slate-600" : "text-slate-900"}`}>
                  {n.title}
                </h3>
                <p className={`text-sm mt-1 ${n.isRead ? "text-slate-500" : "text-slate-700 font-medium"}`}>
                  {n.message}
                </p>
                <div className="text-xs font-semibold text-slate-400 mt-2">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!n.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(n.id)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-100 text-blue-600 transition-colors bg-white/50"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
