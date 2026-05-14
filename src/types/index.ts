export type Role = "SUPER_ADMIN" | "DEPT_ADMIN" | "STUDENT"

export type EventType = "SCHOOL_WIDE" | "DEPARTMENT"

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED"

export type ProposalStatus = "PENDING" | "APPROVED" | "ON_HOLD" | "REJECTED"

export type AttendanceStatus = "PRESENT" | "GUEST" | "CHECKED_OUT"

export type ScanResultStatus =
  | "ready"
  | "present"
  | "guest"
  | "duplicate"
  | "invalid"
  | "no-event"

export interface Department {
  id: string
  code: string
  name: string
  color: string
  lightBg: string
}

export interface User {
  id: string
  fullName: string
  email: string
  role: Role
  studentId?: string | null
  yearLevel?: string | null
  qrCode?: string | null
  isActive: boolean
  createdAt: Date
  departmentId?: string | null
  department?: Department | null
}

export interface Event {
  id: string
  title: string
  description?: string | null
  date: Date
  startTime: string
  endTime: string
  venue: string
  eventType: EventType
  status: EventStatus
  createdById: string
  departmentId?: string | null
  department?: Department | null
  _count?: { attendanceLogs: number }
}

export interface EventProposal {
  id: string
  title: string
  description?: string | null
  date: Date
  startTime: string
  endTime: string
  venue: string
  status: ProposalStatus
  rejectionReason?: string | null
  isPublished: boolean
  submittedAt: Date
  reviewedAt?: Date | null
  submittedBy: User
  department: Department
  event?: Event | null
}

export interface AttendanceLog {
  id: string
  checkIn: Date
  checkOut?: Date | null
  status: AttendanceStatus
  user: User
  event: Event
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
  userId: string
}

export interface SessionPayload {
  userId: string
  email: string
  role: Role
  fullName: string
  departmentId?: string | null
  departmentCode?: string | null
}

export interface ScanResult {
  status: ScanResultStatus
  user?: User | null
  checkInTime?: string | null
  message?: string | null
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
