// backend/check-database.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("\n=== CHECKING DATABASE ===\n");

    // Get one center
    const center = await prisma.center.findFirst({
      where: {
        slug: 'designhive-studio'
      }
    });

    if (!center) {
      console.log("❌ Center not found!");
      return;
    }

    console.log("✅ Center found:", center.name);
    console.log("\n--- COURSES ARRAY ---");
    console.log("Type:", typeof center.courses);
    console.log("Value:", center.courses);
    console.log("Length:", center.courses?.length);

    console.log("\n--- COURSE DETAILS ---");
    console.log("Type:", typeof center.courseDetails);
    console.log("Value:", center.courseDetails);

    // Try to parse if it's a string
    if (typeof center.courseDetails === 'string') {
      console.log("\n⚠️ courseDetails is a STRING - needs parsing!");
      try {
        const parsed = JSON.parse(center.courseDetails);
        console.log("Parsed successfully:");
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log("❌ Parse error:", e.message);
      }
    } else if (Array.isArray(center.courseDetails)) {
      console.log("\n✅ courseDetails is already an ARRAY");
      console.log("First course:", center.courseDetails[0]);
    } else if (center.courseDetails === null) {
      console.log("\n❌ courseDetails is NULL - database not seeded!");
    } else {
      console.log("\n📝 courseDetails type:", typeof center.courseDetails);
      console.log("Value:", center.courseDetails);
    }

    console.log("\n=========================\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();