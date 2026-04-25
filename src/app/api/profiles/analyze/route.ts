import { NextRequest, NextResponse } from 'next/server';
import { analyzeProfileAuthenticity } from '@/lib/aiDetection';
import prisma from '@/lib/prisma';

/**
 * POST /api/profiles/analyze
 * Analyzes a profile for authenticity and flags suspicious profiles
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, profileId, name, bio, skills, hourlyRate, category } = body;

    // Validate input
    if (!userId && !profileId) {
      return NextResponse.json(
        { error: 'Either userId or profileId is required' },
        { status: 400 }
      );
    }

    // Run AI analysis
    const analysisResult = await analyzeProfileAuthenticity({
      name,
      bio,
      skills: skills ? (typeof skills === 'string' ? JSON.parse(skills) : skills) : [],
      hourlyRate,
      category
    });

    // If using profileId, update the profile with the detection result
    if (profileId) {
      await prisma.freelancerProfile.update({
        where: { id: profileId },
        data: {
          isSuspicious: analysisResult.isSuspicious
        }
      });
    }

    // If using userId, find and update their profile
    if (userId) {
      await prisma.freelancerProfile.updateMany({
        where: { userId },
        data: {
          isSuspicious: analysisResult.isSuspicious
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
      where: { userId }
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
