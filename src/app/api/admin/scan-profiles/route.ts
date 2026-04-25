import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzeProfileAuthenticity } from '@/lib/aiDetection';

/**
 * POST /api/admin/scan-profiles
 * Admin endpoint to scan all or specific profiles for fake accounts
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify admin access
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { userIds } = body; // Optional: scan specific users

    let profiles = [];
    
    if (userIds && userIds.length > 0) {
      // Scan specific users
      profiles = await prisma.freelancerProfile.findMany({
        where: {
          userId: {
            in: userIds
          }
        },
        include: { user: true }
      });
    } else {
      // Scan all freelancer profiles
      profiles = await prisma.freelancerProfile.findMany({
        include: { user: true }
      });
    }

    const analysisResults = [];
    let suspiciousCount = 0;

    // Analyze each profile
    for (const profile of profiles) {
      let skills: string[] = [];
      try {
        skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
      } catch {
        skills = [];
      }

      const result = await analyzeProfileAuthenticity({
        name: profile.user?.name,
        bio: profile.bio || undefined,
        skills,
        hourlyRate: profile.hourlyRate || undefined,
        category: profile.category
      });

      // Update profile with detailed detection results
      await prisma.freelancerProfile.update({
        where: { id: profile.id },
        data: { 
          isSuspicious: result.isSuspicious,
          riskScore: result.riskScore,
          detectionReasons: JSON.stringify(result.reasons),
          flaggedFields: JSON.stringify(result.flaggedFields),
          lastScannedAt: new Date()
        }
      });

      if (result.isSuspicious) {
        suspiciousCount++;
      }

      analysisResults.push({
        profileId: profile.id,
        userId: profile.userId,
        userName: profile.user?.name,
        userEmail: profile.user?.email,
        riskScore: result.riskScore,
        isSuspicious: result.isSuspicious,
        reasons: result.reasons,
        flaggedFields: result.flaggedFields
      });
    }

    return NextResponse.json({
      success: true,
      scannedCount: profiles.length,
      suspiciousCount,
      flaggedProfiles: analysisResults.filter(r => r.isSuspicious),
      results: analysisResults
    }, { status: 200 });

  } catch (error) {
    console.error('Profile scan error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/flagged-profiles
 * Get all flagged/suspicious profiles
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verify admin access
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const flaggedProfiles = await prisma.freelancerProfile.findMany({
      where: { isSuspicious: true },
      include: { user: true },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      count: flaggedProfiles.length,
      profiles: flaggedProfiles.map(p => {
        let reasons: string[] = [];
        try {
          reasons = typeof p.detectionReasons === 'string' ? JSON.parse(p.detectionReasons) : [];
        } catch {
          reasons = [];
        }
        
        return {
          id: p.id,
          userId: p.userId,
          name: p.user?.name,
          email: p.user?.email,
          category: p.category,
          bio: p.bio?.substring(0, 100),
          hourlyRate: p.hourlyRate,
          riskScore: p.riskScore,
          detectionReasons: reasons,
          lastScannedAt: p.lastScannedAt,
          flaggedAt: p.updatedAt
        };
      })
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch flagged profiles error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
