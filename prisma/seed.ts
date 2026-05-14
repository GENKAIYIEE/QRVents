import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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
  const hashedPasswordStudent = await bcrypt.hash("Student@123", 12)

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

  // STEP 3 — Create BSIT Dept Admin
  const deptAdmin = await prisma.user.upsert({
    where: { email: "richelle@pclaunion.edu.ph" },
    update: {},
    create: {
      email: "richelle@pclaunion.edu.ph",
      fullName: "Richelle Santos",
      passwordHash: hashedPasswordAdmin,
      role: "DEPT_ADMIN",
      departmentId: createdDepartments["BSIT"],
    },
  })

  // STEP 4 — Create 2 sample students
  await prisma.user.upsert({
    where: { email: "juan@pclaunion.edu.ph" },
    update: {},
    create: {
      fullName: "Juan dela Cruz",
      email: "juan@pclaunion.edu.ph",
      passwordHash: hashedPasswordStudent,
      role: "STUDENT",
      departmentId: createdDepartments["BSIT"],
      yearLevel: "2nd Year",
      studentId: "2024-00123",
      qrCode: crypto.randomUUID(),
    },
  })

  await prisma.user.upsert({
    where: { email: "maria@pclaunion.edu.ph" },
    update: {},
    create: {
      fullName: "Maria Santos",
      email: "maria@pclaunion.edu.ph",
      passwordHash: hashedPasswordStudent,
      role: "STUDENT",
      departmentId: createdDepartments["BSHM"],
      yearLevel: "3rd Year",
      studentId: "2024-00456",
      qrCode: crypto.randomUUID(),
    },
  })

  // STEP 5 — Create 2 sample events
  const future30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const future15Days = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)

  await prisma.event.create({
    data: {
      title: "College Foundation Day 2025",
      eventType: "SCHOOL_WIDE",
      status: "UPCOMING",
      date: future30Days,
      startTime: "8:00 AM",
      endTime: "5:00 PM",
      venue: "PCLaUnion Gymnasium",
      createdById: superAdmin.id,
    },
  })

  await prisma.event.create({
    data: {
      title: "IT Day 2025",
      eventType: "DEPARTMENT",
      status: "UPCOMING",
      departmentId: createdDepartments["BSIT"],
      date: future15Days,
      startTime: "8:00 AM",
      endTime: "5:00 PM",
      venue: "Computer Laboratory",
      createdById: deptAdmin.id,
    },
  })

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

