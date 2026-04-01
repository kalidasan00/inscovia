// backend/scripts/migrateToOrgs.js
// ✅ Run ONCE to migrate InstituteUser → User + Organization + OrgMember
// Usage: node scripts/migrateToOrgs.js

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateSlug(name, city) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const ts = Date.now().toString(36);
  return `${base}-${citySlug}-${ts}`;
}

async function main() {
  console.log("🚀 Starting migration: InstituteUser → User + Organization\n");

  const institutes = await prisma.instituteUser.findMany();
  console.log(`📋 Found ${institutes.length} institutes to migrate\n`);

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (const inst of institutes) {
    try {
      // ── Step 1: Check if User already exists with this email ──
      let user = await prisma.user.findUnique({ where: { email: inst.email } });

      if (user) {
        console.log(`⚠️  User already exists for ${inst.email} — skipping user creation`);
        skipped++;
      } else {
        // ── Step 2: Create unified User ──
        user = await prisma.user.create({
          data: {
            name: inst.instituteName,
            email: inst.email,
            phone: inst.phone,
            password: inst.password, // already hashed ✅
            isVerified: inst.isVerified,
            isActive: inst.isActive,
            role: "USER",
          }
        });
        console.log(`✅ Created User: ${inst.email}`);
      }

      // ── Step 3: Create Organization ──
      const orgSlug = generateSlug(inst.instituteName, inst.city);
      const org = await prisma.organization.create({
        data: {
          name: inst.instituteName,
          slug: orgSlug,
          primaryCategory: inst.primaryCategory,
          secondaryCategories: inst.secondaryCategories,
          teachingMode: inst.teachingMode,
          state: inst.state,
          district: inst.district,
          city: inst.city,
          location: inst.location,
          latitude: inst.latitude,
          longitude: inst.longitude,
          isActive: inst.isActive,
        }
      });
      console.log(`✅ Created Organization: ${inst.instituteName} (${orgSlug})`);

      // ── Step 4: Create OrgMember (OWNER) ──
      await prisma.orgMember.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: "OWNER",
          status: "ACTIVE",
        }
      });
      console.log(`✅ Created OrgMember: ${inst.email} → OWNER of ${inst.instituteName}`);

      // ── Step 5: Update Centers — link to Organization ──
      const centers = await prisma.center.findMany({
        where: { userId: inst.id }
      });

      for (const center of centers) {
        await prisma.center.update({
          where: { id: center.id },
          data: { orgId: org.id }
        });
        console.log(`✅ Linked Center: ${center.name} → ${inst.instituteName}`);
      }

      success++;
    } catch (err) {
      console.error(`❌ Failed for ${inst.email}:`, err.message);
      failed++;
    }
  }

  console.log(`\n🎉 Migration complete!`);
  console.log(`✅ Success: ${success}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Failed:  ${failed}`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error("❌ Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});