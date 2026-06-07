import * as fs from "fs"
import * as path from "path"

// Load .env manually (ts-node doesn't auto-load it)
const envPath = path.resolve(__dirname, ".env")
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8")
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIdx = trimmed.indexOf("=")
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "")
    if (!process.env[key]) process.env[key] = val
  }
}

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function cleanMockData() {
  console.log("🔍 Starting mock data cleanup...\n")

  // Step 1 — Attendance logs (FK → users, events)
  const deletedAttendance = await prisma.attendanceLog.deleteMany({})
  console.log(`✅ Deleted ${deletedAttendance.count} attendance log(s)`)

  // Step 2 — Notifications (FK → users)
  const deletedNotifications = await prisma.notification.deleteMany({})
  console.log(`✅ Deleted ${deletedNotifications.count} notification(s)`)

  // Step 3 — Event proposals (FK → events, users, departments)
  const deletedProposals = await prisma.eventProposal.deleteMany({})
  console.log(`✅ Deleted ${deletedProposals.count} event proposal(s)`)

  // Step 4 — Events (FK → departments, users)
  const deletedEvents = await prisma.event.deleteMany({})
  console.log(`✅ Deleted ${deletedEvents.count} event(s)`)

  // Step 5 — Activity logs (no FK constraints)
  const deletedActivityLogs = await prisma.activityLog.deleteMany({})
  console.log(`✅ Deleted ${deletedActivityLogs.count} activity log(s)`)

  // Step 6 — Scanner pins (FK → users, but users are kept)
  const deletedScannerPins = await prisma.scannerPin.deleteMany({})
  console.log(`✅ Deleted ${deletedScannerPins.count} scanner pin(s)`)

  // Verify preserved data
  const userCount = await prisma.user.count()
  const deptCount = await prisma.department.count()

  console.log("\n📊 Preserved data:")
  console.log(`   👤 Users:       ${userCount}`)
  console.log(`   🏫 Departments: ${deptCount}`)
  console.log("\n✅ Cleanup complete! All mock data removed.")
}

cleanMockData()
  .catch((e) => {
    console.error("❌ Error during cleanup:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
