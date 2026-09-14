/**
 * FreelancerSuggestionCard Component
 * Displays a matched freelancer with matching scores and details
 */

'use client';

import Link from 'next/link';
import { Badge, Card, Button } from '@/components/ui';

export interface FreelancerSuggestion {
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  overallScore: number;
  skillSimilarity: number;
  performanceScore: number;
  responsiveness: number;
  matchDetails: {
    skillMatch: string[];
    performanceFactors: string[];
    responsivenessFactors: string[];
  };
}

interface FreelancerSuggestionCardProps {
  suggestion: FreelancerSuggestion;
  onInvite?: (freelancerId: string) => void;
  onViewProfile?: (freelancerId: string) => void;
}

export function FreelancerSuggestionCard({
  suggestion,
  onInvite,
  onViewProfile
}: FreelancerSuggestionCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="grid md:grid-cols-4 gap-6 items-start">
        {/* Freelancer Info */}
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-2">Freelancer</p>
          <Link href={`/freelancer/${suggestion.freelancerId}`}>
            <h3 className="text-lg font-semibold text-primary-600 hover:underline cursor-pointer">
              {suggestion.freelancerName}
            </h3>
          </Link>
          <p className="text-sm text-neutral-600">{suggestion.freelancerEmail}</p>
        </div>

        {/* Match Score */}
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-2">Overall Match</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${getScoreColor(suggestion.overallScore)}`}>
              {suggestion.overallScore}%
            </p>
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-neutral-600">
                Skills: <span className="font-semibold text-neutral-900">{suggestion.skillSimilarity}%</span>
              </span>
              <span className="text-neutral-600">
                Performance: <span className="font-semibold text-neutral-900">{suggestion.performanceScore}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Matching Factors */}
        <div>
          <p className="text-sm font-medium text-neutral-600 mb-2">Why This Match?</p>
          <ul className="text-sm space-y-1">
            {suggestion.matchDetails.skillMatch.length > 0 && (
              <li>✓ Skills: {suggestion.matchDetails.skillMatch.slice(0, 2).join(', ')}</li>
            )}
            {suggestion.matchDetails.performanceFactors.length > 0 && (
              <li>✓ {suggestion.matchDetails.performanceFactors[0]}</li>
            )}
            {suggestion.matchDetails.responsivenessFactors.length > 0 && (
              <li>✓ {suggestion.matchDetails.responsivenessFactors[0]}</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Link href={`/freelancer/${suggestion.freelancerId}`}>
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => onViewProfile?.(suggestion.freelancerId)}
            >
              View Profile
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onInvite?.(suggestion.freelancerId)}
          >
            Invite to Job
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default FreelancerSuggestionCard;
