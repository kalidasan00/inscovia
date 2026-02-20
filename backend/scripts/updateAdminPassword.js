// backend/scripts/updateAdminPassword.js
// Run: node scripts/updateAdminPassword.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ✏️ CHANGE THIS to your new password
const NEW_PASSWORD = 'YourNewPassword@123';
const ADMIN_EMAIL = 'admin@inscovia.com';

async function updatePassword() {
  try {
    const hashed = await bcrypt.hash(NEW_PASSWORD, 10);

    await prisma.instituteUser.update({
      where: { email: ADMIN_EMAIL },
      data: { password: hashed }
    });

    console.log('✅ Admin password updated successfully!');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 New password: ${NEW_PASSWORD}`);
    console.log('⚠️  Delete this script after use!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();