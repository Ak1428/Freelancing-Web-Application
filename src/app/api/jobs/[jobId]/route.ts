import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

interface Params {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { jobId } = await params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.job.update({
      where: { id: jobId },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error fetching job by id:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/jobs/:jobId
 * Update job status, select freelancer, or mark as complete
 */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { jobId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // Verify ownership
    if (job.clientId !== (session.user as any).id) {
      return NextResponse.json(
        { message: 'Only the job owner can update this job' },
        { status: 403 }
      );
    }

    const { status, selectedFreelancerId } = await req.json();

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: status || undefined,
        selectedFreelancerId: selectedFreelancerId || undefined
      },
      include: {
        client: { select: { name: true } }
      }
    });

    // Create notification for selected freelancer
    if (selectedFreelancerId) {
      await prisma.notification.create({
        data: {
          userId: selectedFreelancerId,
          type: 'JOB_SELECTED',
          title: 'You were selected!',
          message: `You've been selected for the job "${job.title}"`,
          link: `/jobs/${job.id}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
