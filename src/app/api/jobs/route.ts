import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== 'CLIENT') {
      return NextResponse.json(
        { message: 'Unauthorized. Only clients can post jobs.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      title: rawTitle,
      description: rawDescription,
      budget,
      requiredSkills,
      category,
      deadline,
    } = body;

    // Validate required fields
    const title = String(rawTitle ?? '').trim();
    const description = String(rawDescription ?? '').trim();
    if (!rawTitle || !rawDescription || !budget) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, budget' },
        { status: 400 }
      );
    }

    // Trim and validate title
    if (title.length < 10 || title.length > 200) {
      return NextResponse.json(
        { message: 'Job title must be between 10 and 200 characters' },
        { status: 400 }
      );
    }

    // Trim and validate description
    if (description.length < 20 || description.length > 5000) {
      return NextResponse.json(
        { message: 'Job description must be between 20 and 5000 characters' },
        { status: 400 }
      );
    }

    // Validate budget
    const parsedBudget = parseFloat(String(budget));
    if (isNaN(parsedBudget) || parsedBudget <= 0) {
      return NextResponse.json(
        { message: 'Budget must be a positive number' },
        { status: 400 }
      );
    }

    // Cap budget at reasonable max (10 million)
    if (parsedBudget > 10000000) {
      return NextResponse.json(
        { message: 'Budget cannot exceed $10,000,000' },
        { status: 400 }
      );
    }

    // Parse and validate skills
    let skillsArray: string[] = [];
    if (requiredSkills) {
      if (typeof requiredSkills === 'string') {
        skillsArray = requiredSkills
          .split(',')
          .map((s: string) => String(s).trim().toLowerCase())
          .filter((s: string) => s.length > 0 && s.length < 50);
      } else if (Array.isArray(requiredSkills)) {
        skillsArray = requiredSkills
          .map((s: string) => String(s).trim().toLowerCase())
          .filter((s: string) => s.length > 0 && s.length < 50);
      }
    }

    // Limit to 20 skills
    if (skillsArray.length > 20) {
      skillsArray = skillsArray.slice(0, 20);
    }

    // Validate deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { message: 'Invalid deadline format' },
          { status: 400 }
        );
      }
      // Deadline should be in future
      if (deadlineDate < new Date()) {
        return NextResponse.json(
          { message: 'Deadline must be in the future' },
          { status: 400 }
        );
      }
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget: parsedBudget,
        category: category ? String(category).trim() : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        requiredSkills: JSON.stringify(skillsArray),
        clientId: (session.user as any).id,
      },
      include: {
        client: { select: { name: true, id: true } }
      }
    });

    // Auto-Notify Feature (Matching Freelancers) - batch operation
    if (skillsArray.length > 0) {
      const matchingFreelancers = await prisma.freelancerProfile.findMany({
        where: {
          isSuspicious: false,
          skills: {
            // This is a simple contains check; a full-text search would be better
            not: '[]'
          }
        },
        select: { userId: true, skills: true }
      });

      // Filter freelancers by skill match
      const matchingIds = matchingFreelancers
        .filter(f => {
          const freelancerSkills = JSON.parse(f.skills || '[]');
          return skillsArray.some(skill => freelancerSkills.includes(skill));
        })
        .map(f => f.userId);

      if (matchingIds.length > 0) {
        // Batch create notifications/messages
        const messages = matchingIds.map(userId => ({
          senderId: (session.user as any).id,
          receiverId: userId,
          jobId: job.id,
          content: `System Notice: A new job "${job.title}" matching your skills was just posted. Budget: $${job.budget}. Check it out!`,
        }));

        await prisma.message.createMany({ data: messages });
      }
    }

    return NextResponse.json(
      { 
        message: 'Job posted successfully',
        job,
        notifiedCount: skillsArray.length > 0 ? 'Freelancers with matching skills have been notified' : 'No skill-based notifications sent'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error posting job:', error);
    return NextResponse.json(
      { message: 'Failed to post job. Please try again.' },
      { status: 500 }
    );
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
