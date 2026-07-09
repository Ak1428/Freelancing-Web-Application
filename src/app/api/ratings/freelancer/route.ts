import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/ratings/freelancer
 * Get comprehensive rating for a freelancer based on portfolio, reviews, and performance
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerId = searchParams.get('freelancerId');

    if (!freelancerId) {
      return NextResponse.json(
        { error: 'freelancerId parameter is required' },
        { status: 400 }
      );
    }

    // Get freelancer profile
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
      include: {
        user: {
          include: {
            reviewsReceived: true,
            applications: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Freelancer not found' },
        { status: 404 }
      );
    }

    // Get portfolio projects
    const portfolio = await prisma.portfolioProject.findMany({
      where: { freelancerId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate comprehensive rating
    const ratingBreakdown = {
      // Review-based rating (40%)
      reviewRating: profile.rating,
      reviewCount: profile.reviewCount,
      reviewWeight: 40,

      // Performance metrics (30%)
      performanceMetrics: {
        completedJobs: profile.completedJobs,
        totalEarnings: profile.totalEarnings,
        jobSuccessRate: profile.user.applications.length > 0
          ? (profile.user.applications.filter(a => a.status === 'ACCEPTED').length /
             profile.user.applications.length * 100)
          : 0
      },
      performanceWeight: 30,

      // Portfolio quality (20%)
      portfolioMetrics: {
        totalProjects: portfolio.length,
        verifiedProjects: portfolio.filter(p => p.verificationStatus === 'VERIFIED').length,
        aiGeneratedProjects: portfolio.filter(p => p.isAiGenerated).length,
        avgProjectBudget: portfolio.length > 0
          ? portfolio.reduce((sum, p) => sum + (p.budget || 0), 0) / portfolio.length
          : 0
      },
      portfolioWeight: 20,

      // Responsiveness & Engagement (10%)
      engagementMetrics: {
        responseTimeHours: profile.responseTime,
        reviewsGiven: profile.user.reviewsReceived.length,
        idVerified: profile.user.idVerified,
        daysSinceMemberJoined: Math.floor(
          (Date.now() - profile.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
      },
      engagementWeight: 10
    };

    // Calculate weighted score
    let totalScore = 0;

    // Review score (40%)
    totalScore += (profile.rating / 5) * 100 * 0.4;

    // Performance score (30%)
    const performanceScore = Math.min(
      100,
      (ratingBreakdown.performanceMetrics.jobSuccessRate * 0.6) + // 60% job success
      Math.min(100, (profile.completedJobs / 20) * 100 * 0.4) // 40% completed jobs
    );
    totalScore += performanceScore * 0.3;

    // Portfolio score (20%)
    const portfolioScore = Math.min(
      100,
      ((portfolio.length / 10) * 100 * 0.6) + // Portfolio size
      (((portfolio.length - ratingBreakdown.portfolioMetrics.aiGeneratedProjects) / Math.max(1, portfolio.length)) * 100 * 0.4) // Legitimacy
    );
    totalScore += portfolioScore * 0.2;

    // Engagement score (10%)
    const engagementScore = Math.min(
      100,
      (Math.min(profile.responseTime, 72) / 72 * 100 * 0.5) + // Response time
      (profile.user.idVerified ? 100 : 50) * 0.5 // ID verification
    );
    totalScore += engagementScore * 0.1;

    // Overall rating is the weighted score divided by 20 to get 0-5 scale
    const overallRating = totalScore / 20;

    // Risk assessment
    let riskFactors: string[] = [];
    if (profile.isSuspicious) {
      riskFactors.push(`High risk profile (score: ${profile.riskScore}%)`);
    }
    if (ratingBreakdown.portfolioMetrics.aiGeneratedProjects > 0) {
      riskFactors.push(
        `${ratingBreakdown.portfolioMetrics.aiGeneratedProjects} AI-generated projects detected`
      );
    }
    if (profile.reviewCount === 0 && profile.completedJobs > 5) {
      riskFactors.push('No reviews despite completed jobs');
    }

    return NextResponse.json({
      success: true,
      freelancerId,
      overallRating: Math.min(5, Math.max(0, overallRating)),
      ratingBreakdown,
      riskFactors,
      trustScore: Math.min(100, Math.max(0, totalScore))
    });
  } catch (error) {
    console.error('Error calculating freelancer rating:', error);
    return NextResponse.json(
      { error: 'Failed to calculate freelancer rating' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings/freelancer
 * Update freelancer rating (admin only)
 */
export async function POST(req: Request) {
  try {
    const { freelancerId, ratingAdjustment, reason } = await req.json();

    if (!freelancerId || ratingAdjustment === undefined) {
      return NextResponse.json(
        { error: 'freelancerId and ratingAdjustment required' },
        { status: 400 }
      );
    }

    // This endpoint should be admin-only in production
    // For now, we'll just log the adjustment
    console.log(
      `[Rating Adjustment] User: ${freelancerId}, Adjustment: ${ratingAdjustment}, Reason: ${reason}`
    );

    return NextResponse.json({
      success: true,
      message: 'Rating adjustment recorded'
    });
  } catch (error) {
    console.error('Error updating freelancer rating:', error);
    return NextResponse.json(
      { error: 'Failed to update freelancer rating' },
      { status: 500 }
    );
  }
}
