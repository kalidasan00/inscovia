// backend/scripts/checkAndFixAdmin.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkAndFix() {
  try {
    // ── 1. Find the user ──────────────────────────────────────────────────────
    const admin = await prisma.user.findUnique({
      where: { email: "admin@inscovia.com" },
      select: {
        id: true, email: true, role: true,
        adminRole: true, isActive: true,
        isVerified: true, password: true,
      },
    });

    if (!admin) {
      console.log("❌ No user found with email admin@inscovia.com");
      console.log("👉 Creating fresh admin...");

      const hashed = await bcrypt.hash("Admin@123", 12);
      const created = await prisma.user.create({
        data: {
          name: "Super Admin",
          email: "admin@inscovia.com",
          password: hashed,
          phone: "",
          role: "ADMIN",
          adminRole: "SUPER_ADMIN",
          permissions: [],
          isVerified: true,
          isActive: true,
        },
      });
      console.log("✅ Created! Login with Admin@123");
      return;
    }

    // ── 2. Print current state ────────────────────────────────────────────────
    console.log("📋 Current state:");
    console.log("   email:      ", admin.email);
    console.log("   role:       ", admin.role,      admin.role === "ADMIN"        ? "✅" : "❌ needs ADMIN");
    console.log("   adminRole:  ", admin.adminRole,  admin.adminRole === "SUPER_ADMIN" ? "✅" : "❌ needs SUPER_ADMIN");
    console.log("   isActive:   ", admin.isActive,   admin.isActive   ? "✅" : "❌ needs true");
    console.log("   isVerified: ", admin.isVerified, admin.isVerified  ? "✅" : "❌ needs true");
    console.log("   password:   ", admin.password ? "set ✅" : "MISSING ❌");

    // ── 3. Fix roles + reset password ────────────────────────────────────────
    const hashed = await bcrypt.hash("Admin@123", 12);
    const fixed = await prisma.user.update({
      where: { email: "admin@inscovia.com" },
      data: {
        role:       "ADMIN",
        adminRole:  "SUPER_ADMIN",
        isActive:   true,
        isVerified: true,
        password:   hashed, // ✅ reset to known password
      },
    });

    console.log("\n✅ Fixed! Everything updated.");
    console.log("📧 Email:    admin@inscovia.com");
    console.log("🔑 Password: Admin@123");
    console.log("👤 Role:     ADMIN / SUPER_ADMIN");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFix();