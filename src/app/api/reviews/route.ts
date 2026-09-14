import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/reviews
 * Create or update a review for a freelancer
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { revieweeId, rating, title, comment, jobId, isAnonymous } = await req.json();

    // Validate revieweeId
    if (!revieweeId || typeof revieweeId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid reviewee ID' },
        { status: 400 }
      );
    }

    // Validate rating
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate title if provided
    if (title && (String(title).length < 2 || String(title).length > 100)) {
      return NextResponse.json(
        { message: 'Review title must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate and sanitize comment if provided
    let sanitizedComment = '';
    if (comment) {
      sanitizedComment = String(comment).trim().substring(0, 5000);
      if (sanitizedComment.length < 3) {
        return NextResponse.json(
          { message: 'Review comment must be at least 3 characters' },
          { status: 400 }
        );
      }
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        reviewerId: (session.user as any).id,
        revieweeId,
        rating,
        title: title ? String(title).trim() : `${rating}-star review`,
        comment: sanitizedComment,
        jobId: jobId ? String(jobId) : null,
        isAnonymous: Boolean(isAnonymous)
      },
      include: {
        reviewer: { select: { name: true, ...(isAnonymous ? {} : { email: true }) } }
      }
    });

    // Update freelancer's average rating
    const reviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.freelancerProfile.update({
      where: { userId: revieweeId },
      data: {
        rating: parseFloat(avgRating.toFixed(2)),
        reviewCount: reviews.length
      }
    });

    return NextResponse.json(
      { message: 'Review created successfully', review },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create review' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reviews?userId=xxx
 * Get all reviews for a user
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId parameter required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
