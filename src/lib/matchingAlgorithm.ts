/**
 * Advanced Freelancer-Job Matching Algorithm (Mindex)
 * Implements weighted scoring model with skill similarity, performance history, and responsiveness
 */

import prisma from '@/lib/prisma';

export interface MatchingScore {
  overallScore: number; // 0-100
  skillSimilarity: number; // Simvec score
  performanceScore: number; // Scorehist score
  responsiveness: number; // Rateresp score
  matchDetails: {
    skillMatch: string[];
    performanceFactors: string[];
    responsivenessFactors: string[];
  };
}

export interface ClientPreferences {
  skillWeightage: number; // 0-1, default 0.5
  performanceWeightage: number; // 0-1, default 0.3
  responsivenessWeightage: number; // 0-1, default 0.2
  minimumRating: number; // default 3.5
  minimumCompletedJobs: number; // default 0
  preferredCategories: string[]; // optional filter
  excludeFlags: boolean; // exclude flagged profiles, default true
}

/**
 * Calculate skill similarity (Simvec) between job requirements and freelancer skills
 * Uses simple vector similarity - counts matching skills as a percentage
 */
export function calculateSkillSimilarity(
  requiredSkills: string[],
  freelancerSkills: string[]
): number {
  if (requiredSkills.length === 0) return 50; // Neutral score if no skills specified

  const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());
  const normalizedFreelancer = freelancerSkills.map(s => s.toLowerCase().trim());

  // Exact matches
  const exactMatches = normalizedRequired.filter(skill =>
    normalizedFreelancer.includes(skill)
  ).length;

  // Partial matches (skill contains or is contained in)
  let partialMatches = 0;
  for (const req of normalizedRequired) {
    for (const freelance of normalizedFreelancer) {
      if (req.includes(freelance) || freelance.includes(req)) {
        if (!normalizedFreelancer.includes(req)) {
          partialMatches++;
        }
        break;
      }
    }
  }

  const totalMatches = exactMatches + (partialMatches * 0.5); // Partial matches count as 0.5
  const skillSimilarity = (totalMatches / normalizedRequired.length) * 100;

  return Math.min(100, skillSimilarity);
}

/**
 * Calculate performance score (Scorehist) based on freelancer's work history
 * Considers: completed jobs, average rating, earnings, verification status
 */
export async function calculatePerformanceScore(freelancerId: string): Promise<number> {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: freelancerId },
    include: {
      user: {
        include: {
          applications: {
            where: { status: 'ACCEPTED' }
          },
          reviewsReceived: true
        }
      }
    }
  });

  if (!profile) return 0;

  let performanceScore = 0;

  // Factor 1: Completed jobs (max 40 points)
  const completedJobsScore = Math.min((profile.completedJobs / 10) * 40, 40);
  performanceScore += completedJobsScore;

  // Factor 2: Average rating (max 40 points)
  const ratingScore = (profile.rating / 5) * 40;
  performanceScore += ratingScore;

  // Factor 3: Review count (max 15 points)
  const reviewCountScore = Math.min((profile.reviewCount / 5) * 15, 15);
  performanceScore += reviewCountScore;

  // Factor 4: Verification status (max 5 points)
  const verificationScore = profile.user.idVerified ? 5 : 0;
  performanceScore += verificationScore;

  return Math.min(100, performanceScore);
}

/**
 * Calculate responsiveness score (Rateresp) based on freelancer's communication metrics
 * Considers: response time, application acceptance rate, review engagement
 */
export async function calculateResponsiveness(freelancerId: string): Promise<number> {
  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: freelancerId },
    include: {
      user: {
        include: {
          applications: true,
          reviewsReceived: true,
          reviewsGiven: true
        }
      }
    }
  });

  if (!profile) return 0;

  let responsivenessScore = 0;

  // Factor 1: Response time in hours (max 35 points)
  // Lower response time = higher score
  const maxResponseHours = 72; // 3 days
  const responseTime = Math.max(0, maxResponseHours - (profile.responseTime || 24));
  const responseScore = (responseTime / maxResponseHours) * 35;
  responsivenessScore += responseScore;

  // Factor 2: Application acceptance rate (max 35 points)
  const totalApplications = profile.user.applications.length;
  if (totalApplications > 0) {
    const acceptedApplications = profile.user.applications.filter(
      a => a.status === 'ACCEPTED'
    ).length;
    const acceptanceRate = acceptedApplications / totalApplications;
    responsivenessScore += acceptanceRate * 35;
  }

  // Factor 3: Review engagement (max 20 points)
  // Given reviews shows active engagement
  const reviewEngagement = Math.min((profile.user.reviewsGiven.length / 3) * 20, 20);
  responsivenessScore += reviewEngagement;

  // Factor 4: Last scanned recently (max 10 points)
  if (profile.lastScannedAt) {
    const daysSinceScanned = Math.floor(
      (Date.now() - profile.lastScannedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceScanned < 7) {
      responsivenessScore += 10;
    } else if (daysSinceScanned < 30) {
      responsivenessScore += 5;
    }
  }

  return Math.min(100, responsivenessScore);
}

/**
 * Main matching function - calculates overall match score between job and freelancer
 */
export async function calculateMatchScore(
  jobId: string,
  freelancerId: string,
  clientPreferences?: ClientPreferences
): Promise<MatchingScore | null> {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
      include: {
        user: {
          select: { idVerified: true, email: true }
        }
      }
    });

    if (!job || !freelancerProfile) return null;

    // Get client preferences or use defaults
    const prefs = clientPreferences || {
      skillWeightage: 0.5,
      performanceWeightage: 0.3,
      responsivenessWeightage: 0.2,
      minimumRating: 3.5,
      minimumCompletedJobs: 0,
      preferredCategories: [],
      excludeFlags: true
    };

    // Check minimum requirements
    if (freelancerProfile.rating < prefs.minimumRating) return null;
    if (freelancerProfile.completedJobs < prefs.minimumCompletedJobs) return null;
    if (prefs.excludeFlags && freelancerProfile.isSuspicious) return null;
    if (prefs.preferredCategories.length > 0 && 
        !prefs.preferredCategories.includes(freelancerProfile.category)) {
      return null;
    }

    // Parse skills
    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(job.requiredSkills || '[]');
    } catch {
      requiredSkills = [];
    }

    let freelancerSkills: string[] = [];
    try {
      freelancerSkills = JSON.parse(freelancerProfile.skills || '[]');
    } catch {
      freelancerSkills = [];
    }

    // Calculate component scores
    const skillSimilarity = calculateSkillSimilarity(requiredSkills, freelancerSkills);
    const performanceScore = await calculatePerformanceScore(freelancerId);
    const responsiveness = await calculateResponsiveness(freelancerId);

    // Validate weights sum to approximately 1
    const totalWeight = prefs.skillWeightage + prefs.performanceWeightage + prefs.responsivenessWeightage;
    const normalizedSkillWeight = prefs.skillWeightage / totalWeight;
    const normalizedPerformanceWeight = prefs.performanceWeightage / totalWeight;
    const normalizedResponsivenessWeight = prefs.responsivenessWeightage / totalWeight;

    // Calculate weighted overall score
    const overallScore =
      (skillSimilarity * normalizedSkillWeight) +
      (performanceScore * normalizedPerformanceWeight) +
      (responsiveness * normalizedResponsivenessWeight);

    // Determine match details
    const matchDetails = {
      skillMatch: freelancerSkills.filter(skill =>
        requiredSkills.some(req => 
          req.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      ),
      performanceFactors: [
        `${freelancerProfile.completedJobs} completed jobs`,
        `${freelancerProfile.rating.toFixed(1)}/5.0 rating`,
        `${freelancerProfile.reviewCount} reviews`,
        freelancerProfile.user?.idVerified ? 'ID verified' : 'Not ID verified'
      ],
      responsivenessFactors: [
        `${freelancerProfile.responseTime || 24}h average response time`,
        `${Math.round((Math.min(freelancerProfile.completedJobs, 10) / 10) * 100)}% engagement rate`
      ]
    };

    return {
      overallScore: Math.round(overallScore),
      skillSimilarity: Math.round(skillSimilarity),
      performanceScore: Math.round(performanceScore),
      responsiveness: Math.round(responsiveness),
      matchDetails
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    return null;
  }
}

/**
 * Find top matching freelancers for a job
 */
export async function findMatchingFreelancers(
  jobId: string,
  limit: number = 10,
  clientPreferences?: ClientPreferences
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job) return [];

    // Get all freelancers
    const freelancers = await prisma.freelancerProfile.findMany({
      include: { user: true },
      where: {
        // Exclude user who already applied
        NOT: {
          user: {
            applications: {
              some: { jobId }
            }
          }
        }
      }
    });

    // Calculate scores for each freelancer
    const matchedFreelancers: any[] = [];

    for (const freelancer of freelancers) {
      const score = await calculateMatchScore(jobId, freelancer.userId, clientPreferences);
      if (score && score.overallScore >= 50) { // Only return matches above 50%
        matchedFreelancers.push({
          freelancer,
          matchScore: score
        });
      }
    }

    // Sort by overall score and return top matches
    return matchedFreelancers
      .sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore)
      .slice(0, limit)
      .map(m => ({
        freelancerId: m.freelancer.userId,
        freelancerName: m.freelancer.user.name,
        freelancerEmail: m.freelancer.user.email,
        ...m.matchScore
      }));
  } catch (error) {
    console.error('Error finding matching freelancers:', error);
    return [];
  }
}

/**
 * Find top matching jobs for a freelancer
 */
export async function findMatchingJobs(
  freelancerId: string,
  limit: number = 10
) {
  try {
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
      include: { user: true }
    });

    if (!freelancerProfile) return [];

    // Get open jobs
    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        // Exclude jobs user already applied to
        NOT: {
          applications: {
            some: { freelancerId }
          }
        }
      },
      include: { client: true }
    });

    // Calculate scores for each job
    const matchedJobs: any[] = [];

    for (const job of jobs) {
      const score = await calculateMatchScore(job.id, freelancerId);
      if (score && score.overallScore >= 50) {
        matchedJobs.push({
          job,
          matchScore: score
        });
      }
    }

    // Sort by overall score and return top matches
    return matchedJobs
      .sort((a, b) => b.matchScore.overallScore - a.matchScore.overallScore)
      .slice(0, limit)
      .map(m => ({
        jobId: m.job.id,
        jobTitle: m.job.title,
        jobBudget: m.job.budget,
        clientName: m.job.client.name,
        ...m.matchScore
      }));
  } catch (error) {
    console.error('Error finding matching jobs:', error);
    return [];
  }
}
