import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/applications
 * Submit a new application for a job
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, coverLetter, proposedRate } = await req.json();
    const freelancerId = (session.user as any).id;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true }
    });

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: { jobId, freelancerId }
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        freelancerId,
        coverLetter: coverLetter || null,
        proposedRate: proposedRate ? parseFloat(proposedRate) : null,
        status: 'PENDING'
      },
      include: {
        freelancer: { select: { name: true, email: true } }
      }
    });

    // Notify client
    await prisma.notification.create({
      data: {
        userId: job.clientId,
        type: 'APPLICATION',
        title: 'New application received',
        message: `${session.user.name} applied for "${job.title}"`,
        link: `/jobs/${jobId}`
      }
    });

    return NextResponse.json(
      { success: true, message: 'Application submitted successfully', application },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications
 * Get applications - for job owner or freelancer
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const userId = (session.user as any).id;

    let applications;

    if (jobId) {
      // Get applications for a specific job
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      
      if (!job || job.clientId !== userId) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 403 }
        );
      }

      applications = await prisma.application.findMany({
        where: { jobId },
        include: {
          freelancer: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Get applications by current user (freelancer)
      applications = await prisma.application.findMany({
        where: { freelancerId: userId },
        include: {
          job: { select: { id: true, title: true, budget: true, status: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Application fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications/:id
 * Accept or reject an application
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');
    const { status } = await req.json();

    const application = await prisma.application.findUnique({
      where: { id: applicationId || '' },
      include: { job: true }
    });

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (application.job.clientId !== (session.user as any).id) {
      return NextResponse.json(
        { message: 'Only job owner can update applications' },
        { status: 403 }
      );
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId || '' },
      data: { status }
    });

    // If accepted, update selected freelancer in job
    if (status === 'ACCEPTED') {
      await prisma.job.update({
        where: { id: application.jobId },
        data: {
          selectedFreelancerId: application.freelancerId,
          status: 'IN_PROGRESS'
        }
      });
    }

    // Notify freelancer
    const statusMessage = status === 'ACCEPTED' ? 'accepted' : 'rejected';
    await prisma.notification.create({
      data: {
        userId: application.freelancerId,
        type: 'APPLICATION_UPDATE',
        title: `Your application was ${statusMessage}`,
        message: `Your application for "${application.job.title}" was ${statusMessage}`,
        link: `/jobs/${application.jobId}`
      }
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
