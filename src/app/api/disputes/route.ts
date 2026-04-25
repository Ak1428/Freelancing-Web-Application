import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/disputes
 * Create a new dispute
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { respondentId, title, description, jobId } = await req.json();
    const initiatorId = (session.user as any).id;

    const dispute = await prisma.dispute.create({
      data: {
        initiatorId,
        respondentId,
        title,
        description,
        jobId: jobId || null,
        status: 'OPEN'
      },
      include: {
        initiator: { select: { name: true, email: true } },
        respondent: { select: { name: true, email: true } }
      }
    });

    // Create notification for respondent
    await prisma.notification.create({
      data: {
        userId: respondentId,
        type: 'DISPUTE',
        title: 'New Dispute',
        message: `${session.user.name} has initiated a dispute: ${title}`,
        link: `/disputes/${dispute.id}`
      }
    });

    return NextResponse.json(
      { success: true, dispute },
      { status: 201 }
    );
  } catch (error) {
    console.error('Dispute creation error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/disputes
 * Get disputes for current user
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const disputes = await prisma.dispute.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { respondentId: userId }
        ]
      },
      include: {
        initiator: { select: { name: true, id: true } },
        respondent: { select: { name: true, id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      disputes
    });
  } catch (error) {
    console.error('Dispute fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/disputes/:id
 * Update dispute status or add admin notes
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only admins can update disputes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const disputeId = searchParams.get('id');
    const { status, resolution, adminNotes } = await req.json();

    const dispute = await prisma.dispute.update({
      where: { id: disputeId || '' },
      data: {
        status: status || undefined,
        resolution: resolution || undefined,
        adminNotes: adminNotes || undefined
      }
    });

    return NextResponse.json({
      success: true,
      dispute
    });
  } catch (error) {
    console.error('Dispute update error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
