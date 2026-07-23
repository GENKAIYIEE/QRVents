const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const eventId = "5f82373a-cd1b-434c-82f8-3e2bd9f9a312"; // from the user's error URL
    const search = "";
    
    const whereClause = {
      eventId,
      user: {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } }
        ]
      }
    };

    console.log("Running query...");
    const [logs, total, groupBy] = await Promise.all([
      prisma.attendanceLog.findMany({
        where: whereClause,
        orderBy: [
          { checkIn: "desc" },
          { id: "desc" }
        ],
        skip: 0,
        take: 20,
        include: {
          user: {
            select: {
              fullName: true,
              studentId: true,
              yearLevel: true,
              section: true,
              department: { select: { code: true, color: true } }
            }
          }
        }
      }),
      prisma.attendanceLog.count({ where: whereClause }),
      prisma.attendanceLog.groupBy({
        by: ['status'],
        where: { eventId },
        _count: true
      })
    ]);

    console.log("SUCCESS");
  } catch (e) {
    console.error("PRISMA ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
