// backend/scripts/activatePapers.js
// Run: node scripts/activatePapers.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function activate() {
  const result = await prisma.previousYearPaper.updateMany({
    where: { isActive: false },
    data: { isActive: true },
  });

  console.log(`✅ Activated ${result.count} papers`);
  await prisma.$disconnect();
}

activate().catch(async (err) => {
  console.error("❌ Failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});