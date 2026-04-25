/**
 * AI-Powered Fake Profile Detection System
 * Analyzes profile data for authenticity using multiple heuristics
 */

interface DetectionResult {
  isSuspicious: boolean;
  riskScore: number; // 0-100
  reasons: string[];
  flaggedFields: string[];
}

/**
 * Analyze text content for common spam/scam indicators
 */
function analyzeTextContent(text: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const lowerText = text.toLowerCase();

  // Suspicious keywords/patterns
  const suspiciousKeywords = [
    { pattern: /guarantee|guaranteed/, reason: 'Contains "guaranteed" claims' },
    { pattern: /100%\s*(genuine|real|authentic)/, reason: 'Uses excessive authenticity claims' },
    { pattern: /click\s*here|click\s*link/, reason: 'Contains suspicious "click here" links' },
    { pattern: /(whatsapp|telegram|viber|wechat).*me/i, reason: 'Requests communication outside platform' },
    { pattern: /cryptocurrency|bitcoin|crypto|blockchain/, reason: 'Mentions cryptocurrency schemes' },
    { pattern: /free\s*money|easy\s*money|quick\s*cash/, reason: 'Makes unrealistic earning claims' },
    { pattern: /investment.*return|roi|passive.*income/, reason: 'Mentions investment returns' },
    { pattern: /nigerian|western\s*union|wire\s*transfer/, reason: 'References common scam methods' },
    { pattern: /pay.*upfront|send.*money|deposit/, reason: 'Requests upfront payments' },
  ];

  for (const { pattern, reason } of suspiciousKeywords) {
    if (pattern.test(lowerText)) {
      reasons.push(reason);
    }
  }

  // Check for excessively short/generic bio
  if (text.trim().length < 15) {
    reasons.push('Profile description is too short');
  }

  // Check for repetitive characters (spam pattern)
  if (/(.)\1{4,}/.test(lowerText)) {
    reasons.push('Contains repetitive character patterns');
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[!@#$%^&*]{2,}/g) || []).length;
  if (specialCharCount > 2) {
    reasons.push('Contains excessive special characters');
  }

  // Check for all caps (often spam)
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const capsRatio = capsCount / text.length;
  if (capsRatio > 0.4 && text.length > 20) {
    reasons.push('Excessive use of capital letters');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Analyze profile name for authenticity
 */
function analyzeProfileName(name: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for obviously fake names
  if (/\d{5,}/.test(name)) {
    reasons.push('Name contains excessive numbers');
  }

  // Check for very generic names that are red flags
  const genericSpamNames = ['admin', 'test', 'user', 'guest', 'hello'];
  if (genericSpamNames.some(generic => name.toLowerCase() === generic)) {
    reasons.push('Name is suspiciously generic');
  }

  // Check for unusual character combinations
  if (/[^a-zA-Z\s\-\']/.test(name) && !/\d{1,3}/.test(name)) {
    // Allow numbers but not other special chars
    reasons.push('Name contains unusual characters');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Analyze skills list for authenticity
 */
function analyzeSkills(skills: string[]): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for unrealistic skill combinations
  if (skills.length > 30) {
    reasons.push('Claims expertise in suspiciously many skills');
  }

  if (skills.length === 0) {
    reasons.push('No skills listed');
  }

  // Check for generic/suspicious skill names
  const textContent = skills.join(' ').toLowerCase();
  if (textContent.includes('hacking') || textContent.includes('cracking')) {
    reasons.push('Lists potentially illegal services');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Analyze hourly rate for red flags
 */
function analyzeRate(rate: number): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Unrealistically low rate for skilled work
  if (rate < 1) {
    reasons.push('Hourly rate is unrealistically low');
  }

  // Unrealistically high rate (might be a test/scam)
  if (rate > 10000) {
    reasons.push('Hourly rate is unrealistically high');
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Main profile analysis function
 */
export async function analyzeProfileAuthenticity(profileData: {
  name?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  category?: string;
}): Promise<DetectionResult> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  const reasons: string[] = [];
  const flaggedFields: string[] = [];
  let riskScore = 0;

  // Analyze name
  if (profileData.name) {
    const nameAnalysis = analyzeProfileName(profileData.name);
    if (nameAnalysis.suspicious) {
      reasons.push(...nameAnalysis.reasons);
      flaggedFields.push('name');
      riskScore += 15;
    }
  }

  // Analyze bio
  if (profileData.bio) {
    const bioAnalysis = analyzeTextContent(profileData.bio);
    if (bioAnalysis.suspicious) {
      reasons.push(...bioAnalysis.reasons);
      flaggedFields.push('bio');
      riskScore += bioAnalysis.reasons.length * 10;
    }
  }

  // Analyze skills
  if (profileData.skills && profileData.skills.length > 0) {
    const skillsAnalysis = analyzeSkills(profileData.skills);
    if (skillsAnalysis.suspicious) {
      reasons.push(...skillsAnalysis.reasons);
      flaggedFields.push('skills');
      riskScore += skillsAnalysis.reasons.length * 8;
    }
  }

  // Analyze hourly rate
  if (profileData.hourlyRate !== undefined) {
    const rateAnalysis = analyzeRate(profileData.hourlyRate);
    if (rateAnalysis.suspicious) {
      reasons.push(...rateAnalysis.reasons);
      flaggedFields.push('hourlyRate');
      riskScore += rateAnalysis.reasons.length * 12;
    }
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  return {
    isSuspicious: riskScore >= 30,
    riskScore,
    reasons: [...new Set(reasons)], // Remove duplicates
    flaggedFields: [...new Set(flaggedFields)]
  };
}

/**
 * Legacy function for text-only analysis (for backwards compatibility)
 */
export async function analyzeAuthenticity(text: string): Promise<{ isSuspicious: boolean; reason?: string }> {
  const result = await analyzeTextContent(text);
  return {
    isSuspicious: result.suspicious,
    reason: result.reasons.length > 0 ? result.reasons[0] : 'Profile appears authentic.'
  };
}
