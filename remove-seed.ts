import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Removing seeded test data for Certificate Generation...")

  // Find the event first
  const event = await prisma.event.findFirst({
    where: {
      title: "Leadership & Innovation Summit 2026",
    }
  })

  if (!event) {
    console.log("Event not found. It might have been deleted already.")
    return
  }

  // Delete associated attendance logs
  const deletedLogs = await prisma.attendanceLog.deleteMany({
    where: {
      eventId: event.id
    }
  })
  
  console.log(`✅ Deleted ${deletedLogs.count} attendance log(s) for the test event.`)

  // Now delete the event
  const deletedEvent = await prisma.event.delete({
    where: {
      id: event.id
    }
  })

  console.log(`✅ Deleted event: ${deletedEvent.title}`)
  console.log("🎉 Cleanup complete!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
