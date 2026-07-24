import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding test data for Certificate Generation...")

  // 1. Find the student (we'll look for student01, or any student)
  let student = await prisma.user.findFirst({
    where: { studentId: "student01" }
  })
  
  if (!student) {
    student = await prisma.user.findFirst({
      where: { role: "STUDENT" }
    })
  }

  if (!student) {
    console.error("❌ No student found in the database. Cannot seed.")
    process.exit(1)
  }
  
  console.log(`✅ Found Student: ${student.fullName} (ID: ${student.id})`)

  // 2. Find a Super Admin to be the creator
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" }
  })

  if (!admin) {
    console.error("❌ No Super Admin found in the database.")
    process.exit(1)
  }

  // 3. Create a COMPLETED event from yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(9, 0, 0, 0) // 9:00 AM yesterday

  const event = await prisma.event.create({
    data: {
      title: "Leadership & Innovation Summit 2026",
      description: "A major school-wide seminar for leadership development. (Generated for Certificate Testing)",
      date: yesterday,
      startTime: "09:00",
      endTime: "16:00",
      venue: "Main University Auditorium",
      eventType: "SCHOOL_WIDE",
      expectedAttendees: 500,
      status: "COMPLETED",
      createdById: admin.id,
    }
  })

  console.log(`✅ Created COMPLETED Event: ${event.title}`)

  // 4. Create an Attendance Log for the student
  const checkInTime = new Date(yesterday)
  checkInTime.setHours(8, 45, 0, 0) // Checked in at 8:45 AM
  
  const checkOutTime = new Date(yesterday)
  checkOutTime.setHours(16, 15, 0, 0) // Checked out at 4:15 PM

  await prisma.attendanceLog.create({
    data: {
      userId: student.id,
      eventId: event.id,
      checkIn: checkInTime,
      checkOut: checkOutTime,
      status: "PRESENT"
    }
  })

  console.log(`✅ Created Attendance Log for ${student.fullName}`)
  console.log("🎉 Seeding complete! You can now check the Student Portal Attendance History.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
