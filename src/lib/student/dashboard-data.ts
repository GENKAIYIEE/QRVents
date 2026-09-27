import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getDashboardData(options?: { skipSectionCheck?: boolean }) {
  const session = await getSession()
  if (!session || session.role !== "STUDENT") {
    redirect("/login")
  }

  const studentId = session.userId
  const departmentId = session.departmentId
  const { getManilaCalendarToday } = await import("@/lib/time")
  const today = getManilaCalendarToday()

  // Fetch student info first to get yearLevel
  const studentUser = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      department: true,
      _count: {
        select: {
          notifications: { where: { isRead: false } },
          penalties: { where: { status: { in: ["PENDING", "OVERDUE"] } } }
        }
      }
    }
  })

  const yearLevel = studentUser?.yearLevel;
  
  // -- DIRTY SECTION CHECK (FORCE UPDATE FLOW) --
  if (!options?.skipSectionCheck) {
    const deptSections = (studentUser?.department as any)?.sections ?? []
    const hasSectionsConfigured = deptSections.length > 0
    
    // If dept has sections, but user's section is missing or not in the list
    const isSectionDirty = hasSectionsConfigured && (!studentUser?.section || !deptSections.includes(studentUser.section))
    
    if (isSectionDirty) {
      redirect("/student/profile?updateSection=1")
    }
  }
  // ---------------------------------------------

  const targetYearLevelsFilter = yearLevel ? {
    OR: [
      { targetYearLevels: { isEmpty: true } },
      { targetYearLevels: { has: yearLevel } }
    ]
  } : { targetYearLevels: { isEmpty: true } };

  const deptId = studentUser?.departmentId || departmentId;

  const [
    upcomingSchoolWideEvents,
    upcomingDeptEvents,
    upcomingSchoolEventsCount,
    upcomingDeptEventsCount,
    attendanceCount,
    recentAttendance,
    distinctDeptsResult,
    department,
  ] = await Promise.all([
    // Upcoming school-wide events
    prisma.event.findMany({
      where: {
        OR: [
          { status: "ONGOING" },
          { status: "UPCOMING", date: { gte: today } }
        ],
        eventType: "SCHOOL_WIDE",
        AND: [
          {
            OR: [
              { targetDepartments: { isEmpty: true } },
              { targetDepartments: { has: deptId || "" } }
            ]
          },
          targetYearLevelsFilter
        ]
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { department: true }
    }),

    // Upcoming department events
    deptId ? prisma.event.findMany({
      where: {
        eventType: "DEPARTMENT",
        departmentId: deptId,
        AND: [
          {
            OR: [
              { status: "ONGOING" },
              { status: "UPCOMING", date: { gte: today } }
            ]
          },
          targetYearLevelsFilter
        ]
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { department: true }
    }) : Promise.resolve([]),

    // Count of upcoming school-wide events
    prisma.event.count({
      where: {
        OR: [
          { status: "ONGOING" },
          { status: "UPCOMING", date: { gte: today } }
        ],
        eventType: "SCHOOL_WIDE",
        AND: [
          {
            OR: [
              { targetDepartments: { isEmpty: true } },
              { targetDepartments: { has: deptId || "" } }
            ]
          },
          targetYearLevelsFilter
        ]
      }
    }),

    // Count of upcoming department events
    deptId ? prisma.event.count({
      where: {
        eventType: "DEPARTMENT",
        departmentId: deptId,
        AND: [
          {
            OR: [
              { status: "ONGOING" },
              { status: "UPCOMING", date: { gte: today } }
            ]
          },
          targetYearLevelsFilter
        ]
      }
    }) : Promise.resolve(0),

    // Total events attended count
    prisma.attendanceLog.count({
      where: { userId: studentId },
    }),

    // Last 5 attended events with event details
    prisma.attendanceLog.findMany({
      where: { userId: studentId },
      orderBy: { checkIn: "desc" },
      take: 5,
      include: { event: { include: { department: true } } },
    }),

    // Distinct departments visited (for guest attendance count)
    prisma.attendanceLog.findMany({
      where: { userId: studentId },
      select: { event: { select: { departmentId: true } } },
      distinct: ["eventId"],
    }),

    // Department info for color theming
    departmentId ? prisma.department.findUnique({ where: { id: departmentId } }) : null,
  ])

  // Count distinct department IDs (filtering out own department or nulls)
  const distinctDeptIds = new Set(
    distinctDeptsResult
      .map((log) => log.event.departmentId)
      .filter((id) => id !== null && id !== departmentId)
  )

  const upcomingEvents = [...upcomingSchoolWideEvents, ...upcomingDeptEvents];

  return {
    upcomingEvents,
    upcomingSchoolEventsCount,
    upcomingDeptEventsCount,
    attendanceCount,
    recentAttendance,
    distinctDeptsVisited: distinctDeptIds.size,
    department,
    session,
    studentUser
  }
}
