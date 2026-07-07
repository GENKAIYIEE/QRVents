import { PrismaClient } from "@prisma/client"
import { generatePenaltiesForEvent } from "../src/lib/penalty"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting penalties seed...")

  // Find the student to use as createdBy (any admin works, but we just need a valid id)
  const superAdmin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
  if (!superAdmin) {
    console.log("No super admin found.")
    return
  }

  // 1. Create a past mandatory event that students missed
  const pastEvent = await prisma.event.create({
    data: {
      title: "Mandatory Student Assembly 2025",
      eventType: "SCHOOL_WIDE",
      status: "COMPLETED",
      isMandatory: true,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      startTime: "8:00 AM",
      endTime: "12:00 PM",
      venue: "Main Hall",
      createdById: superAdmin.id,
    }
  })

  console.log(`Created past event: ${pastEvent.title}`)

  // 2. Generate penalties for this event
  // Because NO students checked in (we didn't create any attendance logs),
  // ALL students will receive a penalty.
  console.log(`Generating penalties for event ID: ${pastEvent.id}...`)
  const result = await generatePenaltiesForEvent(pastEvent.id)
  
  console.log(`Penalties generation result:`, result)
  console.log("Penalties seed complete! Refresh your browser to see the penalty.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
