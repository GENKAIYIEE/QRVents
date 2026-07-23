const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  try {
    console.log("Adding column section to users...");
    await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "section" TEXT;`;
    console.log("SUCCESS: Column added.");
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
