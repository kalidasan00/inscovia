// backend/add-slugs-to-centers.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSlugsToExistingCenters() {
  try {
    console.log("🔍 Fetching all centers...");

    // Get ALL centers without filtering by slug
    const centers = await prisma.center.findMany();

    console.log(`📋 Found ${centers.length} total centers\n`);

    let updated = 0;

    // Process each center
    for (const center of centers) {
      // Skip if already has slug
      if (center.slug && center.slug !== '') {
        console.log(`⏭️  ${center.name} already has slug: ${center.slug}`);
        continue;
      }

      // Generate base slug from center name
      const baseSlug = center.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Add city to make it unique
      let slug = `${baseSlug}-${center.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      let counter = 1;

      // Check if slug already exists
      let existingCenter = await prisma.center.findFirst({ where: { slug } });
      while (existingCenter && existingCenter.id !== center.id) {
        slug = `${baseSlug}-${center.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${counter}`;
        counter++;
        existingCenter = await prisma.center.findFirst({ where: { slug } });
      }

      // Update center with slug
      await prisma.center.update({
        where: { id: center.id },
        data: { slug }
      });

      console.log(`✅ ${center.name} → ${slug}`);
      updated++;
    }

    console.log(`\n🎉 Successfully added slugs to ${updated} centers!`);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the script
addSlugsToExistingCenters();