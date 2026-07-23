import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // STEP 1 — Upsert all 7 departments
  const departments = [
    {
      code: "BSIT",
      name: "BS Information Technology",
      color: "#1A3A8F",
      lightBg: "#EEF2FF",
    },
    {
      code: "BEED/BSED",
      name: "Bachelor of Elementary/Secondary Education",
      color: "#DC2626",
      lightBg: "#FEE2E2",
    },
    {
      code: "BSHM",
      name: "BS Hospitality Management",
      color: "#0F6E56",
      lightBg: "#E1F5EE",
    },
    {
      code: "BSTM",
      name: "BS Tourism Management",
      color: "#D97706",
      lightBg: "#FEF3C7",
    },
    {
      code: "BSBA",
      name: "BS Business Administration",
      color: "#0891B2",
      lightBg: "#E0F2FE",
    },
    {
      code: "BSCRIM",
      name: "BS Criminology",
      color: "#7C3AED",
      lightBg: "#EDE9FE",
    },
    {
      code: "BSMARINE",
      name: "BS Marine Transportation",
      color: "#0284C7",
      lightBg: "#E0F2FE",
    },
  ]

  const createdDepartments: Record<string, string> = {}

  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
    createdDepartments[dept.code] = created.id
  }

  const hashedPasswordAdmin = await bcrypt.hash("password123", 12)

  // STEP 2 — Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      passwordHash: hashedPasswordAdmin
    },
    create: {
      email: "admin@gmail.com",
      fullName: "System Administrator",
      passwordHash: hashedPasswordAdmin,
      role: "SUPER_ADMIN",
    },
  })

  console.log("Seeding complete! (Base data and Super Admin only)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
