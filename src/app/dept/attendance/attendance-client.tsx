"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { formatDistanceToNow } from "date-fns"

interface Event {
  id: string
  title: string
  expectedAttendees: number | null
}

interface AttendanceLog {
  id: string
  checkIn: Date | string
  checkOut: Date | string | null
  status: string
  user: {
    fullName: string
    studentId: string | null
    departmentId: string | null
  }
  event: {
    title: string
  }
}

interface AttendanceClientProps {
  activeEvents: Event[]
  initialLogs: AttendanceLog[]
  departmentId: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function AttendanceClient({ activeEvents, initialLogs, departmentId }: AttendanceClientProps) {
  const [logs, setLogs] = useState<AttendanceLog[]>(initialLogs)
  const [selectedEventId, setSelectedEventId] = useState<string>("all")
  const [isRealtimeActive, setIsRealtimeActive] = useState(false)

  // Set up Supabase Realtime subscription
  useEffect(() => {
    // Note: This requires the "attendance_logs" table to have Realtime enabled in Supabase.
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attendance_logs',
        },
        async (payload) => {
          // Fetch the full log details to get user and event names
          try {
            const res = await fetch(`/api/attendance/log/${payload.new.id}`)
            if (res.ok) {
              const fullLog = await res.json()
              setLogs(prev => [fullLog, ...prev])
            }
          } catch (e) {
            console.error("Failed to fetch new log details")
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'attendance_logs',
        },
        async (payload) => {
           setLogs(prev => prev.map(log => log.id === payload.new.id ? { ...log, checkOut: payload.new.checkOut, status: payload.new.status } : log))
        }
      )
      .subscribe((status) => {
        setIsRealtimeActive(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredLogs = selectedEventId === "all" 
    ? logs 
    : logs.filter(l => activeEvents.find(e => e.id === selectedEventId)?.title === l.event.title)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Sidebar Controls */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-slate-800">Connection</h3>
             <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isRealtimeActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
               <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
               {isRealtimeActive ? 'Live' : 'Connecting...'}
             </div>
          </div>

          <h3 className="font-bold text-slate-800 mb-3">Filter by Event</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedEventId("all")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                selectedEventId === "all" ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Active Events
            </button>
            {activeEvents.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  selectedEventId === event.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {event.title}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Quick Stats</h4>
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-sm font-semibold text-slate-600">Total Scans</span>
                 <span className="text-sm font-bold text-slate-900">{filteredLogs.length}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-semibold text-slate-600">Guests</span>
                 <span className="text-sm font-bold text-amber-600">{filteredLogs.filter(l => l.status === 'GUEST').length}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-[20px]">format_list_bulleted</span>
              Recent Scans Feed
            </h2>
            <button onClick={() => window.location.reload()} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
            </button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-3">hourglass_empty</span>
              <h3 className="text-slate-500 font-bold">Waiting for scans...</h3>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-top-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-slate-400">person</span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 leading-tight mb-1 flex items-center gap-2">
                        {log.user.fullName}
                        {log.status === 'GUEST' && (
                          <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider">Guest</span>
                        )}
                        {log.checkOut && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider">Checked Out</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">event</span> {log.event.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
                      {formatDistanceToNow(new Date(log.checkOut || log.checkIn), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
