const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.ujmskzhgqjckyrandoyx:09466763773@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
    }
  }
});

async function main() {
  try {
    const eventId = "5f82373a-cd1b-434c-82f8-3e2bd9f9a312";
    
    console.log("Running query on port 6543...");
    const logs = await prisma.attendanceLog.findMany({
      where: { eventId, user: { section: "A" } },
      take: 1
    });

    console.log("SUCCESS");
  } catch (e) {
    console.error("PRISMA ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
