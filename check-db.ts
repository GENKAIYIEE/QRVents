import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function check() {
  const depts = await prisma.department.findMany()
  console.log(depts.map(d => d.code))
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
