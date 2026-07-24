import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function test() {
  const user = await prisma.user.findFirst({ where: { role: "STUDENT" } })
  if (!user) return

  const events = await prisma.event.findMany({
    include: {
      attendanceLogs: {
        where: { userId: user.id }
      }
    }
  })

  console.log("ALL Events in DB:", events.length)
  events.forEach(e => {
    console.log(`- Title: ${e.title}`)
    console.log(`  Status: ${e.status}`)
    console.log(`  Type: ${e.eventType}`)
    console.log(`  DeptId: ${e.departmentId}`)
    console.log(`  Logs for student: ${e.attendanceLogs.length}`)
  })
}

test()
