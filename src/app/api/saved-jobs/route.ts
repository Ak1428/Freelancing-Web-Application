import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/saved-jobs
 * Save or unsave a job
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, unsave } = await req.json();
    const userId = (session.user as any).id;

    if (unsave) {
      // Remove saved job
      await prisma.savedJob.deleteMany({
        where: { userId, jobId }
      });

      return NextResponse.json({
        success: true,
        message: 'Job removed from saved'
      });
    } else {
      // Save job (upsert to avoid duplicates)
      const savedJob = await prisma.savedJob.upsert({
        where: { userId_jobId: { userId, jobId } },
        update: {},
        create: { userId, jobId }
      });

      return NextResponse.json(
        { success: true, message: 'Job saved successfully', savedJob },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Save job error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/saved-jobs
 * Get all saved jobs for the current user
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            client: {
              select: {
                name: true,
                id: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      count: savedJobs.length,
      savedJobs: savedJobs.map(s => ({
        ...s.job,
        clientName: s.job.client.name,
        savedAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Fetch saved jobs error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
