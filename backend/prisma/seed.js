// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import { centersData } from './seed-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const center of centersData) {
    await prisma.center.create({
      data: center
    });
  }

  console.log(`Seeded ${centersData.length} centers successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });