// backend/scripts/updateAdminPassword.js
// Run: node scripts/updateAdminPassword.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ✏️ CHANGE these before running
const NEW_PASSWORD = "YourNewPassword@123";
const ADMIN_EMAIL  = "admin@inscovia.com";

async function updatePassword() {
  try {
    // ✅ Use prisma.user (not instituteUser — that model no longer exists)
    const hashed = await bcrypt.hash(NEW_PASSWORD, 12);

    const updated = await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { password: hashed },
      select: { email: true, role: true, adminRole: true },
    });

    console.log("✅ Password updated successfully!");
    console.log("📧 Email:    ", updated.email);
    console.log("👤 Role:     ", updated.role);
    console.log("🔑 AdminRole:", updated.adminRole);
    console.log("🔒 Password: ", NEW_PASSWORD);
    console.log("⚠️  Delete this script after use!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();