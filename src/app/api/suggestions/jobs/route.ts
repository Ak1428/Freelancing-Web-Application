import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findMatchingJobs } from '@/lib/matchingAlgorithm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/suggestions/jobs
 * Get job suggestions for a specific freelancer
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerId = searchParams.get('freelancerId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!freelancerId) {
      return NextResponse.json(
        { error: 'freelancerId parameter is required' },
        { status: 400 }
      );
    }

    // Verify freelancer exists
    const freelancer = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId }
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Find matching jobs
    const suggestions = await findMatchingJobs(freelancerId, limit);

    // Store suggestion in database
    const existingSuggestion = await prisma.jobSuggestion.findFirst({
      where: { freelancerId }
    });

    if (existingSuggestion) {
      await prisma.jobSuggestion.update({
        where: { id: existingSuggestion.id },
        data: {
          suggestedJobs: JSON.stringify(suggestions),
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.jobSuggestion.create({
        data: {
          freelancerId,
          suggestedJobs: JSON.stringify(suggestions)
        }
      });
    }

    return NextResponse.json({
      success: true,
      freelancerId,
      totalSuggestions: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching job suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job suggestions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/suggestions/jobs
 * Generate job suggestions for authenticated freelancer
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== 'FREELANCER') {
      return NextResponse.json(
        { error: 'Unauthorized - Freelancer access required' },
        { status: 401 }
      );
    }

    const freelancerId = (session.user as any).id;
    const { limit = 10 } = await req.json();

    // Verify freelancer profile exists
    const freelancer = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId }
    });

    if (!freelancer) {
      return NextResponse.json(
        { error: 'Freelancer profile not found' },
        { status: 404 }
      );
    }

    // Find matching jobs
    const suggestions = await findMatchingJobs(freelancerId, limit);

    // Store suggestion in database
    const existingSuggestion = await prisma.jobSuggestion.findFirst({
      where: { freelancerId }
    });

    let savedSuggestion;
    if (existingSuggestion) {
      savedSuggestion = await prisma.jobSuggestion.update({
        where: { id: existingSuggestion.id },
        data: {
          suggestedJobs: JSON.stringify(suggestions),
          updatedAt: new Date()
        }
      });
    } else {
      savedSuggestion = await prisma.jobSuggestion.create({
        data: {
          freelancerId,
          suggestedJobs: JSON.stringify(suggestions)
        }
      });
    }

    // Send notification to freelancer
    if (suggestions.length > 0) {
      await prisma.notification.create({
        data: {
          userId: freelancerId,
          type: 'JOB_SUGGESTION',
          title: 'New job suggestions for you',
          message: `${suggestions.length} jobs match your profile and skills`,
          link: '/dashboard'
        }
      });
    }

    return NextResponse.json({
      success: true,
      freelancerId,
      totalSuggestions: suggestions.length,
      suggestions,
      savedSuggestion: {
        id: savedSuggestion.id,
        generatedAt: savedSuggestion.generatedAt
      }
    });
  } catch (error) {
    console.error('Error generating job suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate job suggestions' },
      { status: 500 }
    );
  }
}
