import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/freelancer/profile-detail
 * Get detailed freelancer profile with all information
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
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
