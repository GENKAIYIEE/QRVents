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
    const result = await prisma.$queryRawUnsafe('SELECT column_name FROM information_schema.columns WHERE table_name = \'event_proposals\';');
    console.log(result);
  } catch (e) {
    console.error('Failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
