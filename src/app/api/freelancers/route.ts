import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/freelancers
 * Get all freelancer profiles
 * PROTECTED: Only authenticated users can access
 */
export async function GET(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get freelancers based on user role
    // Admins see all profiles, clients see only non-flagged profiles
    const whereClause = (session.user as any).role === 'ADMIN' 
      ? {} 
      : { isSuspicious: false };

    const freelancers = await prisma.freelancerProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // Don't expose email to non-admins
            ...(((session.user as any).role === 'ADMIN') && { email: true }),
          },
        },
      },
      orderBy: { rating: 'desc' }
    });

    // For non-admin users, don't expose certain sensitive fields
    const sanitizedFreelancers = (session.user as any).role === 'ADMIN' 
      ? freelancers 
      : freelancers.map(f => ({
          ...f,
          detectionReasons: undefined,
          flaggedFields: undefined,
          riskScore: undefined,
          lastScannedAt: undefined
        }));

    return NextResponse.json(sanitizedFreelancers);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
