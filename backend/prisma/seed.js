import { PrismaClient } from "@prisma/client";
import { centersData } from "./centers-data.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding centers...");

  // Clear existing data
  await prisma.center.deleteMany();

  for (const center of centersData) {
    await prisma.center.create({
      data: center
    });
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });