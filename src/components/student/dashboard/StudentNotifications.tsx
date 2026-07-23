"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, CircleAlert, Calendar, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { getStudentNotifications, markAsRead, markAllAsRead } from "@/app/student/notifications/actions"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

export function StudentNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 15 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications()
    }, 15000)

    // Handle click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      clearInterval(pollInterval)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await getStudentNotifications()
      
      // If we got new notifications that we didn't have before, we could theoretically play a sound here
      // But for now, we just silently update the list and unread count
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
      // Revert on error
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

  const getIcon = (type: string) => {
    switch (type) {
      case "EVENT_UPCOMING":
      case "EVENT_NEW":
        return <Calendar className="w-4 h-4 text-blue-500" />
      case "ALERT":
        return <CircleAlert className="w-4 h-4 text-rose-500" />
      default:
        return <Info className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
      >
        <Bell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <span className="material-symbols-outlined animate-spin text-blue-500 [font-variation-settings:'FILL'_1] text-2xl">progress_activity</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-700">You're all caught up!</p>
                <p className="text-xs text-slate-400 font-medium mt-1">No new notifications right now.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`group relative p-3 rounded-2xl transition-all duration-200 hover:bg-slate-50 ${
                      !notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                    )}
                    
                    <div className="flex gap-3 pl-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !notification.isRead ? "bg-blue-100/50" : "bg-slate-100"
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className={`text-sm font-bold truncate ${
                            !notification.isRead ? "text-slate-900" : "text-slate-700"
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed line-clamp-2 ${
                          !notification.isRead ? "text-slate-600 font-medium" : "text-slate-500"
                        }`}>
                          {notification.message}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 z-10"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 bg-slate-50/50">
             <Link 
               href="/student/notifications"
               className="block w-full p-3 text-center text-[10px] font-extrabold text-blue-600 hover:text-blue-700 hover:bg-slate-100/50 transition-colors uppercase tracking-widest"
               onClick={() => setIsOpen(false)}
             >
               View all in Inbox
             </Link>
          </div>
        </div>
      )}
    </div>
  )
}
