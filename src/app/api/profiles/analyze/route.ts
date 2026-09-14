import { NextRequest, NextResponse } from 'next/server';
import { analyzeProfileAuthenticity } from '@/lib/aiDetection';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/profiles/analyze
 * Analyzes a profile for authenticity and flags suspicious profiles
 * PROTECTED: Only authenticated users (preferably admins or the profile owner)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, profileId, name, bio, skills, hourlyRate, category } = body;

    // Validate input - must specify either userId or profileId
    if (!userId && !profileId) {
      return NextResponse.json(
        { error: 'Either userId or profileId is required' },
        { status: 400 }
      );
    }

    // Authorization check: users can only analyze their own profile or users must be admin
    const isAdmin = (session.user as any).role === 'ADMIN';
    const isOwnProfile = userId === (session.user as any).id || 
                        (profileId && 
                         await prisma.freelancerProfile.findUnique({ where: { id: profileId } })
                           .then(p => p?.userId === (session.user as any).id));

    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { error: 'Forbidden. You can only analyze your own profile.' },
        { status: 403 }
      );
    }

    const profile = profileId
      ? await prisma.freelancerProfile.findUnique({
          where: { id: profileId },
          include: { user: true }
        })
      : userId
        ? await prisma.freelancerProfile.findFirst({
            where: { userId },
            include: { user: true }
          })
        : null;

    const profileName = name ?? profile?.user?.name ?? 'Unknown';

    // Run AI analysis
    const analysisResult = await analyzeProfileAuthenticity({
      name: profileName,
      bio,
      skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [],
      hourlyRate,
      category
    });

    // Update profile with detection result
    if (profileId) {
      await prisma.freelancerProfile.update({
        where: { id: profileId },
        data: {
          isSuspicious: analysisResult.isSuspicious,
          riskScore: analysisResult.riskScore,
          detectionReasons: JSON.stringify(analysisResult.reasons),
          flaggedFields: JSON.stringify(analysisResult.flaggedFields),
          lastScannedAt: new Date()
        }
      });
    } else if (userId) {
      await prisma.freelancerProfile.updateMany({
        where: { userId },
        data: {
          isSuspicious: analysisResult.isSuspicious,
          riskScore: analysisResult.riskScore,
          detectionReasons: JSON.stringify(analysisResult.reasons),
          flaggedFields: JSON.stringify(analysisResult.flaggedFields),
          lastScannedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        isSuspicious: analysisResult.isSuspicious,
        riskScore: analysisResult.riskScore,
        flaggedFields: analysisResult.flaggedFields,
        reasons: analysisResult.reasons
      }
    });
  } catch (error) {
    console.error('Profile analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/profiles/analyze/:userId
 * Analyze a specific user's profile
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch the profile
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Parse skills if stored as JSON string
    let skills: string[] = [];
    try {
      skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
    } catch {
      skills = [];
    }

    // Run analysis
    const analysisResult = await analyzeProfileAuthenticity({
      name: profile.user?.name,
      bio: profile.bio || undefined,
      skills,
      hourlyRate: profile.hourlyRate || undefined,
      category: profile.category
    });

    // Update if needed
    if (analysisResult.isSuspicious !== profile.isSuspicious) {
      await prisma.freelancerProfile.update({
        where: { id: profile.id },
        data: { isSuspicious: analysisResult.isSuspicious }
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId
      },
      analysis: {
        isSuspicious: analysisResult.isSuspicious,
        riskScore: analysisResult.riskScore,
        flaggedFields: analysisResult.flaggedFields,
        reasons: analysisResult.reasons
      }
    });
  } catch (error) {
    console.error('Profile analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    );
  }
}
