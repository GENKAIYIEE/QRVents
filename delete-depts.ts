import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function removeDepts() {
  const deptsToRemove = ["BSN", "BSE"]

  for (const code of deptsToRemove) {
    try {
      await prisma.department.delete({ where: { code } })
      console.log(`Deleted ${code}`)
    } catch (err: any) {
      console.log(`Could not delete ${code} (might not exist or has relations):`, err.message)
    }
  }
}

removeDepts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
