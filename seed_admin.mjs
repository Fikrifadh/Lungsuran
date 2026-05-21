import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
process.loadEnvFile();

const prisma = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL
});

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@badr.co.id' },
    update: {},
    create: {
      email: 'admin@badr.co.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created/updated:', admin);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
