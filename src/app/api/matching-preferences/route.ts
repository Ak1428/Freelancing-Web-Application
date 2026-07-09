import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/matching-preferences
 * Get client's matching preferences
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = (session.user as any).id;

    const preferences = await prisma.clientMatchingPreference.findUnique({
      where: { clientId }
    });

    if (!preferences) {
      // Return defaults if not set
      return NextResponse.json({
        success: true,
        preferences: {
          clientId,
          skillWeightage: 0.5,
          performanceWeightage: 0.3,
          responsivenessWeightage: 0.2,
          minimumRating: 3.5,
          minimumCompletedJobs: 0,
          preferredCategories: [],
          excludeFlags: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        ...preferences,
        preferredCategories: JSON.parse(preferences.preferredCategories || '[]')
      }
    });
  } catch (error) {
    console.error('Error fetching matching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matching preferences' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/matching-preferences
 * Create or update client's matching preferences
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Client access required' },
        { status: 401 }
      );
    }

    const clientId = (session.user as any).id;
    const {
      skillWeightage = 0.5,
      performanceWeightage = 0.3,
      responsivenessWeightage = 0.2,
      minimumRating = 3.5,
      minimumCompletedJobs = 0,
      preferredCategories = [],
      excludeFlags = true
    } = await req.json();

    // Validate weights sum close to 1
    const totalWeight = skillWeightage + performanceWeightage + responsivenessWeightage;
    if (totalWeight < 0.8 || totalWeight > 1.2) {
      return NextResponse.json(
        { error: 'Weights must sum to approximately 1.0' },
        { status: 400 }
      );
    }

    // Validate minimum values
    if (minimumRating < 0 || minimumRating > 5) {
      return NextResponse.json(
        { error: 'Minimum rating must be between 0 and 5' },
        { status: 400 }
      );
    }

    if (minimumCompletedJobs < 0) {
      return NextResponse.json(
        { error: 'Minimum completed jobs cannot be negative' },
        { status: 400 }
      );
    }

    const preferences = await prisma.clientMatchingPreference.upsert({
      where: { clientId },
      update: {
        skillWeightage,
        performanceWeightage,
        responsivenessWeightage,
        minimumRating,
        minimumCompletedJobs,
        preferredCategories: JSON.stringify(preferredCategories),
        excludeFlags,
        updatedAt: new Date()
      },
      create: {
        clientId,
        skillWeightage,
        performanceWeightage,
        responsivenessWeightage,
        minimumRating,
        minimumCompletedJobs,
        preferredCategories: JSON.stringify(preferredCategories),
        excludeFlags
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Matching preferences updated successfully',
      preferences: {
        ...preferences,
        preferredCategories: JSON.parse(preferences.preferredCategories || '[]')
      }
    });
  } catch (error) {
    console.error('Error updating matching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update matching preferences' },
      { status: 500 }
    );
  }
}
