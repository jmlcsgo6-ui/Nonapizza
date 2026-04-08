const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin2231@gmail.com';
  const password = 'admin2231';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await prisma.adminUser.upsert({
      where: { email },
      update: { password: hashedPassword },
      create: {
        email,
        password: hashedPassword,
        name: 'Admin'
      }
    });
    console.log('User created or updated:', user.email);
  } catch (err) {
    console.error("PRISMA ERROR IS:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
