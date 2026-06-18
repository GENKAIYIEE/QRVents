import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1`
    console.log("Database connection successful:", res)
  } catch (err) {
    console.error("Database connection failed:", err)
  } finally {
    await prisma.$disconnect()
  }
}
main()
