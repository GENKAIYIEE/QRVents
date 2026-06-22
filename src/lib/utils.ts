import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMMM d, yyyy")
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "hh:mm a")
}

export function formatTimeString(timeStr: string) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const [h, m] = parts;
  let hours = parseInt(h, 10);
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy — hh:mm a")
}

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function calculateDuration(
  checkIn: Date | string,
  checkOut: Date | string
) {
  const minutes = differenceInMinutes(
    new Date(checkOut),
    new Date(checkIn)
  )
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function generateQRValue() {
  return crypto.randomUUID()
}
