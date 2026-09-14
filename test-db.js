const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✓ Database connection successful!');
    console.log('Users:', users);
  } catch (err) {
    console.error('✗ Database error:', err.message);
    console.error('Full error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
