import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzeProfileAuthenticity } from '@/lib/aiDetection';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let { category, skills, portfolioUrl, bio, hourlyRate } = body;

    const skillsArray = skills ? skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    // Comprehensive AI Analysis
    const analysisResult = await analyzeProfileAuthenticity({
      name: session.user.name || undefined,
      bio: bio || undefined,
      skills: skillsArray,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      category
    });

    // Log suspicious activity
    if (analysisResult.isSuspicious) {
      console.warn(`[AI Security System] Flagged Profile for User ${session.user.email}`, {
        riskScore: analysisResult.riskScore,
        flaggedFields: analysisResult.flaggedFields,
        reasons: analysisResult.reasons
      });
    }

    const profile = await prisma.freelancerProfile.upsert({
      where: { userId: (session.user as any).id },
      update: {
        category,
        skills: JSON.stringify(skillsArray),
        portfolioUrl,
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isSuspicious: analysisResult.isSuspicious,
      },
      create: {
        userId: (session.user as any).id,
        category,
        skills: JSON.stringify(skillsArray),
        portfolioUrl,
        bio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isSuspicious: analysisResult.isSuspicious,
      },
      include: { user: true }
    });

    return NextResponse.json({ 
      profile, 
      analysis: {
        isSuspicious: analysisResult.isSuspicious,
        riskScore: analysisResult.riskScore,
        flaggedFields: analysisResult.flaggedFields,
        reasons: analysisResult.reasons
      },
      message: analysisResult.isSuspicious 
        ? `⚠️ Profile saved but flagged for review. Risk Level: ${analysisResult.riskScore}%. Issues: ${analysisResult.reasons.slice(0, 2).join(', ')}` 
        : '✓ Profile saved and verified successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error('Profile Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
