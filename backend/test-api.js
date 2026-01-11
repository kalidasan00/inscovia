// backend/test-api.js
// This will show you exactly what your API is returning

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log("\n=== TESTING API RESPONSE ===\n");

    // Simulate what your controller does
    const center = await prisma.center.findUnique({
      where: { slug: 'designhive-studio-pune' }
    });

    if (!center) {
      console.log("❌ Center not found!");
      return;
    }

    console.log("1. Raw from Database:");
    console.log("   courseDetails type:", typeof center.courseDetails);
    console.log("   courseDetails is array?:", Array.isArray(center.courseDetails));
    console.log("   courseDetails value:", center.courseDetails);

    console.log("\n2. What gets sent to frontend:");
    const response = {
      ...center,
      courseDetails: center.courseDetails
    };

    console.log("   Response courseDetails type:", typeof response.courseDetails);
    console.log("   Response courseDetails:", response.courseDetails);

    if (Array.isArray(response.courseDetails) && response.courseDetails.length > 0) {
      console.log("\n3. First Course Details:");
      console.log("   Name:", response.courseDetails[0].name);
      console.log("   Fees:", response.courseDetails[0].fees);
      console.log("   Duration:", response.courseDetails[0].duration);
      console.log("   Category:", response.courseDetails[0].category);
    }

    console.log("\n=========================\n");

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();