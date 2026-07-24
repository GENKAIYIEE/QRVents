const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "events" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;`);
    console.log("Column isArchived added successfully!");
  } catch (e) {
    if (e.message.includes('already exists')) {
      console.log("Column isArchived already exists.");
    } else {
      console.error(e);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
