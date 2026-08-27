// src/lib/time.ts

/**
 * Returns a Date object representing UTC Midnight of the CURRENT calendar day in Manila.
 * This perfectly aligns with Prisma's storage of calendar dates.
 * 
 * E.g., if it is Aug 27 07:00 AM in Manila (Aug 26 23:00 UTC),
 * this returns `2026-08-27T00:00:00.000Z`.
 */
export function getManilaCalendarToday(): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

/**
 * Returns the absolute UTC start and end timestamps for the current 24-hour day in Manila.
 * Use this when querying `createdAt` or other absolute native timestamps.
 * 
 * E.g., for Aug 27 in Manila, this returns:
 * start: `2026-08-26T16:00:00.000Z` (00:00 PHT)
 * end:   `2026-08-27T15:59:59.999Z` (23:59 PHT)
 */
export function getManilaTimestampRangeForToday(): { start: Date; end: Date } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date());
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  const midnightManilaAsUTC = Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
  
  const startOfDayUTC = new Date(midnightManilaAsUTC - (8 * 60 * 60 * 1000));
  const endOfDayUTC = new Date(midnightManilaAsUTC + (16 * 60 * 60 * 1000) - 1);
  
  return { start: startOfDayUTC, end: endOfDayUTC };
}

/**
 * Takes a Prisma calendar date (UTC Midnight) and returns the absolute UTC timestamp
 * representing 23:59:59.999 in Manila for that calendar day.
 */
export function getManilaTimestampEndForDate(date: Date): Date {
  // Prisma Calendar Date: 2026-08-27T00:00:00.000Z
  // We want the end of the day in PHT (23:59 PHT) which is 15:59 UTC.
  // Add 16 hours minus 1 ms.
  return new Date(date.getTime() + (16 * 60 * 60 * 1000) - 1);
}

/**
 * Takes a Prisma calendar date (UTC Midnight) and returns the absolute UTC timestamp
 * representing 00:00:00.000 in Manila for that calendar day.
 */
export function getManilaTimestampStartForDate(date: Date): Date {
  // Prisma Calendar Date: 2026-08-27T00:00:00.000Z
  // We want the start of the day in PHT (00:00 PHT) which is 16:00 UTC (previous day).
  // Subtract 8 hours.
  return new Date(date.getTime() - (8 * 60 * 60 * 1000));
}

/**
 * Returns a simulated Date object whose UTC hours/minutes match Manila's wall clock time.
 * This is used for logic comparisons against time strings (e.g. "08:40").
 */
export function getManilaWallClock(): Date {
  const manilaTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return new Date(manilaTimeStr);
}

/**
 * Takes an absolute UTC timestamp (e.g., `createdAt`) and returns the Prisma Calendar Date
 * (UTC Midnight) for the day it occurred in Manila.
 */
export function getManilaCalendarDateFromTimestamp(timestamp: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(timestamp);
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}
