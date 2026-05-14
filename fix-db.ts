import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixDb() {
  // Find BSEd and update it
  const bsed = await prisma.department.findUnique({ where: { code: "BSEd" } })
  if (bsed) {
    console.log("Found BSEd, updating to BEED/BSED...")
    await prisma.department.update({
      where: { code: "BSEd" },
      data: {
        code: "BEED/BSED",
        name: "Bachelor of Elementary/Secondary Education",
        color: "#DC2626",
        lightBg: "#FEE2E2",
      }
    })
  }

  // Find BSCrim and update it to BSCRIM
  const bscrim = await prisma.department.findUnique({ where: { code: "BSCrim" } })
  if (bscrim) {
    console.log("Found BSCrim, updating to BSCRIM...")
    await prisma.department.update({
      where: { code: "BSCrim" },
      data: {
        code: "BSCRIM",
        name: "BS Criminology",
      }
    })
  }

  // Find BSMT and delete it (if no references exist)
  try {
    const bsmt = await prisma.department.findUnique({ where: { code: "BSMT" } })
    if (bsmt) {
      console.log("Found BSMT, attempting to delete...")
      await prisma.department.delete({ where: { code: "BSMT" } })
    }
  } catch (err) {
    console.log("Could not delete BSMT, maybe it has users:", err)
  }

  // Seed the missing ones (like BSN)
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
      code: "BSN",
      name: "BS Nursing",
      color: "#059669",
      lightBg: "#D1FAE5",
    },
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        color: dept.color,
        lightBg: dept.lightBg,
      },
      create: dept,
    })
  }
  
  // Now, what if the database has other stray departments?
  // We can fetch all and delete those not in the list (if they have no users)
  const allDepts = await prisma.department.findMany()
  const validCodes = departments.map(d => d.code)
  
  for (const d of allDepts) {
    if (!validCodes.includes(d.code)) {
      try {
        await prisma.department.delete({ where: { id: d.id } })
        console.log(`Deleted stray department: ${d.code}`)
      } catch (err) {
        console.log(`Could not delete stray dept ${d.code}:`, err.message)
      }
    }
  }

  console.log("DB update complete.")
}

fixDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
