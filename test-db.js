const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT "penaltiesGenerated" FROM "events" LIMIT 1;');
    console.log('Successfully selected penaltiesGenerated:', result);
  } catch (e) {
    console.error('Failed to select penaltiesGenerated:', e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
