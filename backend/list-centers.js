// backend/list-centers.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCenters() {
  try {
    console.log("\n=== LISTING ALL CENTERS ===\n");

    const centers = await prisma.center.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        courseDetails: true
      }
    });

    if (centers.length === 0) {
      console.log("❌ NO CENTERS IN DATABASE!");
      console.log("\nYou need to seed the database:");
      console.log("  npm run seed");
      return;
    }

    console.log(`✅ Found ${centers.length} centers:\n`);

    centers.forEach((center, i) => {
      console.log(`${i + 1}. ${center.name}`);
      console.log(`   Slug: ${center.slug}`);
      console.log(`   courseDetails type: ${typeof center.courseDetails}`);

      if (center.courseDetails) {
        if (typeof center.courseDetails === 'string') {
          console.log(`   ⚠️  It's a STRING - needs parsing`);
          try {
            const parsed = JSON.parse(center.courseDetails);
            console.log(`   Courses: ${parsed.length}`);
            if (parsed[0]) {
              console.log(`   First: ${parsed[0].name} - ₹${parsed[0].fees} - ${parsed[0].duration}`);
            }
          } catch (e) {
            console.log(`   ❌ Parse error`);
          }
        } else if (Array.isArray(center.courseDetails)) {
          console.log(`   ✅ It's an ARRAY`);
          console.log(`   Courses: ${center.courseDetails.length}`);
          if (center.courseDetails[0]) {
            console.log(`   First: ${center.courseDetails[0].name} - ₹${center.courseDetails[0].fees} - ${center.courseDetails[0].duration}`);
          }
        }
      } else {
        console.log(`   ❌ No courseDetails`);
      }
      console.log('');
    });

    console.log("=========================\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

listCenters();