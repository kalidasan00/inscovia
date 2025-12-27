// backend/scripts/createAdmin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.instituteUser.findUnique({
      where: { email: 'admin@inscovia.com' }
    });

    if (existingAdmin) {
      console.log('❌ Admin already exists!');
      console.log('📧 Email: admin@inscovia.com');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create admin user
    const admin = await prisma.instituteUser.create({
      data: {
        instituteName: 'Inscovia Admin',
        email: 'admin@inscovia.com',
        phone: '1234567890',
        password: hashedPassword,
        type: 'Admin',
        state: 'Karnataka',
        district: 'Bangalore',
        city: 'Bangalore',
        location: 'MG Road',
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@inscovia.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();