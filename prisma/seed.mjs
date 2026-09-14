import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hashPassword = async (password) => bcrypt.hash(password, 10);

async function main() {
  const adminPassword = await hashPassword('admin123');
  const clientPassword = await hashPassword('client123');
  const freelancerPassword = await hashPassword('freelancer123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Ava Carter',
      passwordHash: clientPassword,
      role: 'CLIENT',
      emailVerified: true,
    },
  });

  const freelancer = await prisma.user.upsert({
    where: { email: 'freelancer@example.com' },
    update: {},
    create: {
      email: 'freelancer@example.com',
      name: 'Noah Brooks',
      passwordHash: freelancerPassword,
      role: 'FREELANCER',
      emailVerified: true,
    },
  });

  const secondFreelancer = await prisma.user.upsert({
    where: { email: 'freelancer2@example.com' },
    update: {},
    create: {
      email: 'freelancer2@example.com',
      name: 'Mia Patel',
      passwordHash: freelancerPassword,
      role: 'FREELANCER',
      emailVerified: true,
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer.id },
    update: {
      category: 'TECHNICAL',
      skills: JSON.stringify(['Next.js', 'TypeScript', 'UI Design']),
      bio: 'Full-stack developer with a focus on modern web products.',
      hourlyRate: 45,
      rating: 4.8,
      reviewCount: 12,
      completedJobs: 8,
      totalEarnings: 5400,
      responseTime: 2,
    },
    create: {
      userId: freelancer.id,
      category: 'TECHNICAL',
      skills: JSON.stringify(['Next.js', 'TypeScript', 'UI Design']),
      bio: 'Full-stack developer with a focus on modern web products.',
      hourlyRate: 45,
      rating: 4.8,
      reviewCount: 12,
      completedJobs: 8,
      totalEarnings: 5400,
      responseTime: 2,
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: secondFreelancer.id },
    update: {
      category: 'DESIGN',
      skills: JSON.stringify(['Brand Design', 'Figma', 'UX Research']),
      bio: 'Product designer creating polished experiences for startups.',
      hourlyRate: 38,
      rating: 4.7,
      reviewCount: 9,
      completedJobs: 5,
      totalEarnings: 3100,
      responseTime: 3,
    },
    create: {
      userId: secondFreelancer.id,
      category: 'DESIGN',
      skills: JSON.stringify(['Brand Design', 'Figma', 'UX Research']),
      bio: 'Product designer creating polished experiences for startups.',
      hourlyRate: 38,
      rating: 4.7,
      reviewCount: 9,
      completedJobs: 5,
      totalEarnings: 3100,
      responseTime: 3,
    },
  });

  const job = await prisma.job.findFirst({ where: { title: 'Build a modern landing page' } });
  if (!job) {
    await prisma.job.create({
      data: {
        clientId: client.id,
        title: 'Build a modern landing page',
        description: 'Create a polished landing page for a new B2B SaaS product.',
        budget: 1200,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        status: 'OPEN',
        requiredSkills: JSON.stringify(['React', 'Tailwind CSS']),
        category: 'WEB_DEVELOPMENT',
      },
    });
  }

  const createdJob = await prisma.job.findFirst({ where: { title: 'Build a modern landing page' } });
  if (createdJob) {
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: createdJob.id,
        freelancerId: freelancer.id,
      },
    });

    if (!existingApplication) {
      await prisma.application.create({
        data: {
          jobId: createdJob.id,
          freelancerId: freelancer.id,
          coverLetter: 'I would love to help with this project and bring a strong product mindset.',
          proposedRate: 50,
          status: 'PENDING',
        },
      });
    }
  }

  await prisma.notification.upsert({
    where: { id: `${admin.id}-seed` },
    update: {},
    create: {
      id: `${admin.id}-seed`,
      userId: admin.id,
      type: 'WELCOME',
      title: 'Demo data loaded',
      message: 'The local demo dataset is ready for exploration.',
      link: '/dashboard',
    },
  });

  console.log('Seed data loaded successfully.');
  console.log('Demo accounts:');
  console.log('- admin@example.com / admin123');
  console.log('- client@example.com / client123');
  console.log('- freelancer@example.com / freelancer123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
