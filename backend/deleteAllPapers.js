import prisma from "./src/lib/prisma.js";

const deleted = await prisma.previousYearPaper.deleteMany({});
console.log("Deleted:", deleted.count, "papers");
await prisma.$disconnect();