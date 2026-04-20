// backend/scripts/createAdmin.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // ✅ Check if admin already exists in User table (not instituteUser)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@inscovia.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("👤 Role:", existingAdmin.role);
      console.log("🔑 AdminRole:", existingAdmin.adminRole);
      return;
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    // ✅ Create admin in User table with correct fields
    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@inscovia.com",
        password: hashedPassword,
        phone: "",
        role: "ADMIN",           // ✅ marks as admin
        adminRole: "SUPER_ADMIN", // ✅ full access
        permissions: [],          // SUPER_ADMIN ignores permissions anyway
        isVerified: true,
        isActive: true,
      },
    });

    console.log("✅ Super Admin created successfully!");
    console.log("📧 Email:    admin@inscovia.com");
    console.log("🔑 Password: Admin@123");
    console.log("👤 Role:     SUPER_ADMIN");
    console.log("⚠️  Change this password after first login!");
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();