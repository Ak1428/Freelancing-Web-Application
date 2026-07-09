import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzePortfolioProject } from '@/lib/aiDetection';

/**
 * GET /api/portfolio
 * Get freelancer's portfolio projects
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

    const projects = await prisma.portfolioProject.findMany({
      where: { freelancerId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      freelancerId,
      totalProjects: projects.length,
      projects: projects.map(p => ({
        ...p,
        technologies: JSON.parse(p.technologies || '[]'),
        aiDetectionReasons: JSON.parse(p.aiDetectionReasons || '[]')
      }))
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Add a new portfolio project with AI analysis
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const freelancerId = (session.user as any).id;
    const {
      title,
      description,
      technologies,
      imageUrl,
      projectUrl,
      completionDate,
      budget,
      duration,
      clientFeedback
    } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Verify freelancer profile exists
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId }
    });

    if (!freelancerProfile) {
      return NextResponse.json(
        { error: 'Freelancer profile not found' },
        { status: 404 }
      );
    }

    // Analyze project for AI-generated content
    const analysisResult = await analyzePortfolioProject({
      title,
      description,
      technologies: typeof technologies === 'string'
        ? technologies.split(',').map((t: string) => t.trim())
        : technologies,
      clientFeedback
    });

    // Create portfolio project
    const project = await prisma.portfolioProject.create({
      data: {
        freelancerId,
        title,
        description,
        technologies: JSON.stringify(technologies || []),
        imageUrl: imageUrl || null,
        projectUrl: projectUrl || null,
        completionDate: completionDate ? new Date(completionDate) : null,
        budget: budget ? parseFloat(budget) : null,
        duration: duration || null,
        clientFeedback: clientFeedback || null,
        isAiGenerated: analysisResult.isAiGenerated,
        aiDetectionScore: analysisResult.riskScore,
        aiDetectionReasons: JSON.stringify(analysisResult.reasons),
        verificationStatus: analysisResult.isAiGenerated ? 'FLAGGED' : 'UNVERIFIED'
      }
    });

    // Log if suspicious
    if (analysisResult.isAiGenerated) {
      console.warn(`[Portfolio AI Detection] Flagged project "${title}" by user ${freelancerId}`, {
        riskScore: analysisResult.riskScore,
        reasons: analysisResult.reasons
      });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        technologies: JSON.parse(project.technologies || '[]'),
        aiDetectionReasons: JSON.parse(project.aiDetectionReasons || '[]')
      },
      analysis: {
        isAiGenerated: analysisResult.isAiGenerated,
        riskScore: analysisResult.riskScore,
        reasons: analysisResult.reasons
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio project:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio project' },
      { status: 500 }
    );
  }
}
