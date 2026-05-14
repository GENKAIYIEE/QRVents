import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function addDepts() {
  const newDepts = [
    {
      code: "BSE",
      name: "BS Entrepreneurship",
      color: "#C026D3",
      lightBg: "#FAE8FF",
    },
    {
      code: "BSMARINE",
      name: "BS Marine Transportation",
      color: "#0284C7",
      lightBg: "#E0F2FE",
    }
  ]

  for (const dept of newDepts) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        color: dept.color,
        lightBg: dept.lightBg,
      },
      create: dept,
    })
    console.log(`Upserted ${dept.code}`)
  }
}

addDepts()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
