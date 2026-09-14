import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/freelancer/profile-detail
 * Get detailed freelancer profile with all information
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

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Get freelancer profile
    const freelancer = await prisma.freelancerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Freelancer profile not found' },
        { status: 404 }
      );
    }

    // Check authorization: users can see their own profile or admins can see all
    const isOwnProfile = userId === (session.user as any).id;
    const isAdmin = (session.user as any).role === 'ADMIN';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden. You can only view your own profile.' },
        { status: 403 }
      );
    }

    // Parse JSON fields
    const profile = {
      ...freelancer,
      skills: JSON.parse(freelancer.skills || '[]'),
      detectionReasons: JSON.parse(freelancer.detectionReasons || '[]'),
      flaggedFields: JSON.parse(freelancer.flaggedFields || '[]')
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching freelancer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer profile' },
      { status: 500 }
    );
  }
}
