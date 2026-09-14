const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      yearLevel: { in: ['1st Year', '2nd Year', '3rd Year', '4th Year'] }
    }
  });
  
  for (const user of users) {
    let newYear = user.yearLevel.charAt(0);
    await prisma.user.update({
      where: { id: user.id },
      data: { yearLevel: newYear }
    });
    console.log(`Updated user ${user.email} from ${user.yearLevel} to ${newYear}`);
  }

  const events = await prisma.event.findMany();
  for (const event of events) {
    if (event.targetYearLevels && event.targetYearLevels.length > 0) {
      const newLevels = event.targetYearLevels.map(yl => {
        return yl.includes("Year") ? yl.charAt(0) : yl;
      });
      await prisma.event.update({
        where: { id: event.id },
        data: { targetYearLevels: newLevels }
      });
      console.log(`Updated event ${event.title} levels to ${newLevels}`);
    }
  }

  const proposals = await prisma.eventProposal.findMany();
  for (const prop of proposals) {
    if (prop.targetYearLevels && prop.targetYearLevels.length > 0) {
      const newLevels = prop.targetYearLevels.map(yl => {
        return yl.includes("Year") ? yl.charAt(0) : yl;
      });
      await prisma.eventProposal.update({
        where: { id: prop.id },
        data: { targetYearLevels: newLevels }
      });
      console.log(`Updated proposal ${prop.title} levels to ${newLevels}`);
    }
  }
}

main().then(() => prisma.$disconnect());
