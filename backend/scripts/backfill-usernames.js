// backend/scripts/backfill-usernames.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateUsername(name, id) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");
  const suffix = id.slice(-4);
  return `${base}_${suffix}`;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null },
    select: { id: true, name: true },
  });

  console.log(`Found ${users.length} users without username`);

  for (const user of users) {
    let username = generateUsername(user.name, user.id);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      username = `${username}_${Date.now().toString().slice(-4)}`;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });

    console.log(`Updated ${user.name} → @${username}`);
  }

  console.log("Done!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());