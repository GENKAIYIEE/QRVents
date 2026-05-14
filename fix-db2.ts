import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function fixDb2() {
  // Update BSEd -> BEED/BSED
  const bsed = await prisma.department.findUnique({ where: { code: "BSEd" } })
  if (bsed) {
    console.log("Updating BSEd to BEED/BSED...")
    await prisma.department.update({
      where: { code: "BSEd" },
      data: { code: "BEED/BSED", name: "Bachelor of Elementary/Secondary Education", color: "#DC2626", lightBg: "#FEE2E2" }
    })
  }

  // Update BSCrim -> BSCRIM
  const bscrim = await prisma.department.findUnique({ where: { code: "BSCrim" } })
  if (bscrim) {
    console.log("Updating BSCrim to BSCRIM...")
    await prisma.department.update({
      where: { code: "BSCrim" },
      data: { code: "BSCRIM" }
    })
  }

  // Ensure BSMT is deleted if possible
  try {
    const bsmt = await prisma.department.findUnique({ where: { code: "BSMT" } })
    if (bsmt) {
      console.log("Deleting BSMT...")
      await prisma.department.delete({ where: { code: "BSMT" } })
    }
  } catch (err: any) {
    console.log("Could not delete BSMT:", err.message)
  }

  console.log("Update finished.")
}

fixDb2()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
