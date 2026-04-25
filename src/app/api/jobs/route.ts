import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'CLIENT') {
      return NextResponse.json({ message: 'Unauthorized. Only clients can post jobs.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, budget, requiredSkills } = body;

    const skillsArray = requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean);

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        requiredSkills: JSON.stringify(skillsArray),
        clientId: (session.user as any).id,
      }
    });

    // Auto-Notify Feature (Matching Freelancers)
    const allFreelancers = await prisma.freelancerProfile.findMany();
    const matchingFreelancers = allFreelancers.filter(freelancer => {
      const freelancerSkills = JSON.parse(freelancer.skills || '[]');
      return skillsArray.some((skill: string) => freelancerSkills.includes(skill));
    });

    if (matchingFreelancers.length > 0) {
      const messages = matchingFreelancers.map(freelancer => ({
        senderId: (session.user as any).id,
        receiverId: freelancer.userId,
        jobId: job.id,
        content: `System Notice: A new job "${job.title}" matching your skills was just posted. Budget: $${job.budget}. Check it out!`,
      }));

      await prisma.message.createMany({
        data: messages,
      });
    }

    return NextResponse.json({ job, notifiedCount: matchingFreelancers.length }, { status: 201 });
  } catch (error) {
    console.error('Error posting job:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Filter parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const status = searchParams.get('status') || 'OPEN';
    const skills = searchParams.get('skills');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (minBudget || maxBudget) {
      where.budget = {};
      if (minBudget) where.budget.gte = parseFloat(minBudget);
      if (maxBudget) where.budget.lte = parseFloat(maxBudget);
    }

    if (category) {
      where.category = category;
    }

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'budget_high') {
      orderBy = { budget: 'desc' };
    } else if (sortBy === 'budget_low') {
      orderBy = { budget: 'asc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy,
      include: { client: { select: { id: true, name: true } } },
      take: 50
    });

    // Filter by skills if provided
    let filteredJobs = jobs;
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredJobs = jobs.filter(job => {
        const jobSkills = JSON.parse(job.requiredSkills || '[]')
          .map((s: string) => s.toLowerCase());
        return skillArray.some(skill => 
          jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
        );
      });
    }

    return NextResponse.json({
      success: true,
      count: filteredJobs.length,
      jobs: filteredJobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
