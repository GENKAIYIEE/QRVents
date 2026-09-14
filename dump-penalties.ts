import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const penalties = await prisma.penalty.findMany({
    include: {
      student: {
        select: { fullName: true, department: { select: { code: true } } }
      },
      event: {
        select: { title: true }
      }
    }
  })

  console.log("ALL PENALTIES IN DB:")
  penalties.forEach(p => {
    console.log(`- Student: ${p.student.fullName} (${p.student.department?.code}), Event: ${p.event.title}, Status: ${p.status}`)
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
