/**
 * FlaggedProfileBadge Component
 * Displays a visual indicator for flagged/suspicious profiles
 */

interface FlaggedProfileBadgeProps {
  isSuspicious: boolean;
  riskScore?: number;
  showTooltip?: boolean;
}

export default function FlaggedProfileBadge({ 
  isSuspicious, 
  riskScore = 0,
  showTooltip = true 
}: FlaggedProfileBadgeProps) {
  if (!isSuspicious) {
    return null;
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 border-red-300';
    if (score >= 50) return 'bg-orange-100 border-orange-300';
    return 'bg-yellow-100 border-yellow-300';
  };

  const getRiskIcon = (score: number) => {
    if (score >= 70) return '🚨';
    if (score >= 50) return '⚠️';
    return '⚡';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    return 'Low Risk';
  };

  const getTextColor = (score: number) => {
    if (score >= 70) return 'text-red-700';
    if (score >= 50) return 'text-orange-700';
    return 'text-yellow-700';
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getRiskColor(riskScore)} ${getTextColor(riskScore)} text-xs font-semibold`}
      title={showTooltip ? `Profile flagged as ${getRiskLabel(riskScore)} - Risk Score: ${riskScore}%` : undefined}
    >
      <span>{getRiskIcon(riskScore)}</span>
      <span>FLAGGED</span>
    </div>
  );
}
