import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const bsit = await prisma.department.findUnique({
    where: { code: "BSIT" }
  })

  if (!bsit) {
    console.log("BSIT department not found in DB!")
    return
  }

  const hashedPassword = await bcrypt.hash("password123", 12)

  await prisma.user.upsert({
    where: { email: "IT@gmail.com" },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: "IT@gmail.com",
      fullName: "BSIT Admin",
      passwordHash: hashedPassword,
      role: "DEPT_ADMIN",
      departmentId: bsit.id,
    },
  })

  console.log("Successfully seeded BSIT Dept Admin: IT@gmail.com")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
