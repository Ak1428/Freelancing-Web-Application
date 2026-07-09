import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { findMatchingFreelancers } from '@/lib/matchingAlgorithm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/suggestions/freelancers
 * Get freelancer suggestions for a specific job or auto-generate for all open jobs
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter is required' },
        { status: 400 }
      );
    }

    // Verify job exists and user is the client
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get client's matching preferences
    const clientPrefs = await prisma.clientMatchingPreference.findUnique({
      where: { clientId: job.clientId }
    });

    // Find matching freelancers
    const suggestions = await findMatchingFreelancers(
      jobId,
      limit,
      clientPrefs ? {
        skillWeightage: clientPrefs.skillWeightage,
        performanceWeightage: clientPrefs.performanceWeightage,
        responsivenessWeightage: clientPrefs.responsivenessWeightage,
        minimumRating: clientPrefs.minimumRating,
        minimumCompletedJobs: clientPrefs.minimumCompletedJobs,
        preferredCategories: JSON.parse(clientPrefs.preferredCategories || '[]'),
        excludeFlags: clientPrefs.excludeFlags
      } : undefined
    );

    // Store suggestion in database
    const existingSuggestion = await prisma.freelancerSuggestion.findFirst({
      where: { jobId }
    });

    if (existingSuggestion) {
      await prisma.freelancerSuggestion.update({
        where: { id: existingSuggestion.id },
        data: {
          suggestedFreelancers: JSON.stringify(suggestions),
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.freelancerSuggestion.create({
        data: {
          jobId,
          suggestedFreelancers: JSON.stringify(suggestions)
        }
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      totalSuggestions: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error('Error fetching freelancer suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer suggestions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/suggestions/freelancers
 * Auto-generate freelancer suggestions for a job and notify client
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, limit = 5 } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      );
    }

    // Verify job exists and user is the client
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { client: true }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.clientId !== (session.user as any).id) {
      return NextResponse.json(
        { error: 'Only job client can generate suggestions' },
        { status: 403 }
      );
    }

    // Get client's matching preferences
    const clientPrefs = await prisma.clientMatchingPreference.findUnique({
      where: { clientId: job.clientId }
    });

    // Find matching freelancers
    const suggestions = await findMatchingFreelancers(
      jobId,
      limit,
      clientPrefs ? {
        skillWeightage: clientPrefs.skillWeightage,
        performanceWeightage: clientPrefs.performanceWeightage,
        responsivenessWeightage: clientPrefs.responsivenessWeightage,
        minimumRating: clientPrefs.minimumRating,
        minimumCompletedJobs: clientPrefs.minimumCompletedJobs,
        preferredCategories: JSON.parse(clientPrefs.preferredCategories || '[]'),
        excludeFlags: clientPrefs.excludeFlags
      } : undefined
    );

    // Store suggestion in database
    const existingSuggestion = await prisma.freelancerSuggestion.findFirst({
      where: { jobId }
    });

    let savedSuggestion;
    if (existingSuggestion) {
      savedSuggestion = await prisma.freelancerSuggestion.update({
        where: { id: existingSuggestion.id },
        data: {
          suggestedFreelancers: JSON.stringify(suggestions),
          updatedAt: new Date()
        }
      });
    } else {
      savedSuggestion = await prisma.freelancerSuggestion.create({
        data: {
          jobId,
          suggestedFreelancers: JSON.stringify(suggestions)
        }
      });
    }

    // Send notification to client
    if (suggestions.length > 0) {
      await prisma.notification.create({
        data: {
          userId: job.clientId,
          type: 'SUGGESTION',
          title: 'New freelancer suggestions',
          message: `${suggestions.length} freelancers matched for "${job.title}" job`,
          link: `/jobs/${jobId}`
        }
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      totalSuggestions: suggestions.length,
      suggestions,
      savedSuggestion: {
        id: savedSuggestion.id,
        createdAt: savedSuggestion.generatedAt
      }
    });
  } catch (error) {
    console.error('Error generating freelancer suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate freelancer suggestions' },
      { status: 500 }
    );
  }
}
