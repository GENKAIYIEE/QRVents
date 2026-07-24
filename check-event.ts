import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findFirst({ where: { title: { contains: 'Penalties Event' } } });
  console.log('Event:', event);
  if (event) {
    const penalties = await prisma.penalty.findMany({ where: { eventId: event.id } });
    console.log('Penalties for this event:', penalties);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
