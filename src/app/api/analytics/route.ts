import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/analytics
 * Get user analytics and statistics
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole === 'FREELANCER') {
      // Freelancer analytics
      const profile = await prisma.freelancerProfile.findUnique({
        where: { userId }
      });

      const completedJobs = await prisma.application.count({
        where: {
          freelancerId: userId,
          status: 'ACCEPTED'
        }
      });

      const reviews = await prisma.review.findMany({
        where: { revieweeId: userId }
      });

      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const applications = await prisma.application.findMany({
        where: { freelancerId: userId }
      });

      return NextResponse.json({
        success: true,
        userType: 'freelancer',
        stats: {
          hourlyRate: profile?.hourlyRate || 0,
          totalEarnings: profile?.totalEarnings || 0,
          completedJobs: completedJobs,
          averageRating: avgRating,
          reviewCount: reviews.length,
          totalApplications: applications.length,
          acceptedApplications: applications.filter(a => a.status === 'ACCEPTED').length,
          responseTime: profile?.responseTime || 0
        }
      });
    } else {
      // Client analytics
      const jobsPosted = await prisma.job.count({
        where: { clientId: userId }
      });

      const jobs = await prisma.job.findMany({
        where: { clientId: userId },
        select: { budget: true, status: true }
      });

      const totalSpent = jobs.reduce((sum, job) => sum + job.budget, 0);

      const receivedReviews = await prisma.review.findMany({
        where: { revieweeId: userId }
      });

      return NextResponse.json({
        success: true,
        userType: 'client',
        stats: {
          jobsPosted,
          totalBudget: totalSpent,
          completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
          activeJobs: jobs.filter(j => j.status === 'OPEN' || j.status === 'IN_PROGRESS').length,
          averageJobBudget: jobsPosted > 0 ? totalSpent / jobsPosted : 0,
          ratingAsClient: receivedReviews.length > 0
            ? receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length
            : 0,
          reviewCount: receivedReviews.length
        }
      });
    }
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
