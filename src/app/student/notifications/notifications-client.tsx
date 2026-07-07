"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CircleAlert, Calendar, Info, Inbox, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getStudentNotifications, markAsRead, markAllAsRead, deleteAllRead } from "@/app/student/notifications/actions"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await getStudentNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // Optimistic UI update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      await markAsRead(id)
    } catch (error) {
      fetchNotifications()
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      await markAllAsRead()
    } catch (error) {
      fetchNotifications()
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      // Optimistic delete
      setNotifications(prev => prev.filter(n => !n.isRead))
      await deleteAllRead()
    } catch (error) {
      fetchNotifications()
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "EVENT_UPCOMING":
      case "EVENT_NEW":
        return <Calendar className="w-5 h-5 text-blue-500" />
      case "ALERT":
      case "PENALTY":
        return <CircleAlert className="w-5 h-5 text-rose-500" />
      default:
        return <Info className="w-5 h-5 text-slate-500" />
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
            <Inbox className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inbox</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">All your notifications and alerts</p>
          </div>
        </div>

        <div className="flex gap-2">
          {notifications.some(n => n.isRead) && (
            <button 
              onClick={handleDeleteAllRead}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete read
            </button>
          )}
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-blue-500 text-4xl [font-variation-settings:'FILL'_1]">progress_activity</span>
            <p className="text-sm font-medium text-slate-500 mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-lg font-bold text-slate-900">You're all caught up!</p>
            <p className="text-sm text-slate-500 font-medium mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`group relative p-5 sm:p-6 transition-all duration-200 hover:bg-slate-50 flex gap-4 sm:gap-5 ${
                  !notification.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                {!notification.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  !notification.isRead ? "bg-blue-100/50" : "bg-slate-100"
                }`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                    <p className={`text-base font-bold ${
                      !notification.isRead ? "text-slate-900" : "text-slate-700"
                    }`}>
                      {notification.title}
                    </p>
                    <span className="text-xs font-bold text-slate-400 shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${
                    !notification.isRead ? "text-slate-600 font-medium" : "text-slate-500"
                  }`}>
                    {notification.message}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="shrink-0 flex items-center pl-2">
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile Actions */}
      <div className="mt-6 sm:hidden flex justify-center gap-2">
        {notifications.some(n => n.isRead) && (
          <button 
            onClick={handleDeleteAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-sm font-bold rounded-xl active:bg-slate-50 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete read
          </button>
        )}
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl active:bg-slate-50 transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>
    </div>
  )
}
