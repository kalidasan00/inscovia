// backend/scripts/deleteAccounts.js
import prisma from "../src/lib/prisma.js";

const emailsToDelete = [
  "kalidas4446@gmail.com",
  "larrypage959@gmail.com",
  "kalidas.ip0n@gmail.com",
];

async function deleteAccounts() {
  for (const email of emailsToDelete) {
    try {
      const user = await prisma.instituteUser.findUnique({ where: { email } });
      if (!user) {
        console.log(`❌ Not found: ${email}`);
        continue;
      }
      await prisma.instituteUser.delete({ where: { email } });
      console.log(`✅ Deleted: ${email}`);
    } catch (err) {
      console.error(`💥 Failed to delete ${email}:`, err.message);
    }
  }
  await prisma.$disconnect();
}

deleteAccounts();