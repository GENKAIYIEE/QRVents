import { PrismaClient } from '@prisma/client'
import { subDays, startOfDay, endOfDay } from "date-fns"

const prisma = new PrismaClient()

async function verifyReports() {
  console.log("=== Verifying Reports (Part A) ===")
  const startDate = startOfDay(new Date("2026-06-21"))
  const endDate = endOfDay(new Date("2026-07-21"))
  
  const dateFilter = {
    gte: startDate,
    lte: endDate
  }
  
  const [totalEvents, totalAttendance] = await Promise.all([
    prisma.event.count({ where: { date: dateFilter } }),
    prisma.attendanceLog.count({ where: { checkIn: dateFilter } })
  ])
  
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      _count: { select: { users: true, events: { where: { date: dateFilter } } } }
    }
  })

  const deptAttendanceCounts = await Promise.all(
    departments.map(async (dept) => {
      const count = await prisma.attendanceLog.count({
        where: { checkIn: dateFilter, user: { departmentId: dept.id } }
      })
      return { ...dept, attendanceCount: count }
    })
  )

  const summary = {
    totalEvents,
    totalAttendance
  }

  const deptTotalStudents = departments.reduce((acc, d) => acc + d._count.users, 0)
  const deptTotalEvents = departments.reduce((acc, d) => acc + d._count.events, 0)
  const deptTotalAttendance = deptAttendanceCounts.reduce((acc, d) => acc + d.attendanceCount, 0)
  
  console.log("Summary Section Calculations:")
  console.log("- Total Events (from summary query):", summary.totalEvents)
  console.log("- Total Attendance (from summary query):", summary.totalAttendance)
  console.log("- Total Students (calc from departments):", deptTotalStudents)
  
  console.log("\nDepartment Breakdown Sums:")
  console.log("- Events Sum:", deptTotalEvents)
  console.log("- Attendance Sum:", deptTotalAttendance)
  console.log("- Students Sum:", deptTotalStudents)
}

async function verifyLiveAttendanceExport() {
  console.log("\n=== Verifying Live Attendance Export (Part B) ===")
  
  // Find an event to seed or test
  let event = await prisma.event.findFirst({
    where: { title: "Test Export Event" }
  })
  
  if (!event) {
    const dept = await prisma.department.findFirst()
    // Seed >50 logs
    const users = await prisma.user.findMany({ take: 60, select: { id: true, departmentId: true } })

    event = await prisma.event.create({
      data: {
        title: "Test Export Event",
        date: new Date(),
        startTime: "08:00",
        endTime: "10:00",
        venue: "Test Venue",
        eventType: "SCHOOL_WIDE",
        departmentId: dept!.id,
        isMandatory: false,
        createdById: users[0].id
      }
    })
    

    
    const logs = users.map((u, i) => ({
      eventId: event!.id,
      userId: u.id,
      checkIn: new Date(),
      status: i % 2 === 0 ? "PRESENT" : "GUEST"
    }))
    
    await prisma.attendanceLog.createMany({ data: logs as any })
    console.log(`Seeded ${logs.length} attendance records for event: ${event.title}`)
  } else {
    console.log(`Found existing event: ${event.title}`)
  }

  const totalLogs = await prisma.attendanceLog.count({ where: { eventId: event.id } })
  console.log(`Actual DB record count for event: ${totalLogs}`)

  // Simulate Export Logic (Fetching all in batches)
  const BATCH_SIZE = 1000
  let skip = 0
  let keepFetching = true
  let exportedRecords = 0

  while (keepFetching) {
    const logs = await prisma.attendanceLog.findMany({
      where: { eventId: event.id },
      orderBy: { checkIn: "desc" },
      skip,
      take: BATCH_SIZE
    })
    
    if (logs.length === 0) break
    exportedRecords += logs.length
    skip += BATCH_SIZE
  }
  
  console.log(`Export logic fetched record count: ${exportedRecords}`)
  console.log(`Exported == DB? ${totalLogs === exportedRecords}`)
  
  // Test with active filter
  skip = 0
  let filteredExported = 0
  while (true) {
    const logs = await prisma.attendanceLog.findMany({
      where: { eventId: event.id, status: "PRESENT" },
      skip,
      take: BATCH_SIZE
    })
    if (logs.length === 0) break
    filteredExported += logs.length
    skip += BATCH_SIZE
  }
  
  const totalFilteredDb = await prisma.attendanceLog.count({ where: { eventId: event.id, status: "PRESENT" } })
  
  console.log(`Filtered Export (status=PRESENT) fetched count: ${filteredExported}`)
  console.log(`Filtered Export == DB Filtered? ${totalFilteredDb === filteredExported}`)
}

async function main() {
  await verifyReports()
  await verifyLiveAttendanceExport()
  process.exit(0)
}

main().catch(console.error)
