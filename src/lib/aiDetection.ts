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

// ========== AI-GENERATED CONTENT DETECTION FOR PORTFOLIO PROJECTS ==========

interface PortfolioAnalysisResult {
  isAiGenerated: boolean;
  riskScore: number; // 0-100
  reasons: string[];
}

/**
 * Analyze portfolio project description for AI-generated content indicators
 */
function analyzeProjectDescription(description: string): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const lowerText = description.toLowerCase();

  // Detect overly formal or generic language patterns common in AI outputs
  const aiPatterns = [
    { pattern: /^(this\s+(project|solution|application|system)|leveraging|synergize|dynamic)/i, reason: 'Contains generic AI-like opening' },
    { pattern: /\b(utilize|implement|facilitate|optimize|streamline|maximize|enhance)\b/gi, reason: 'Uses business jargon typical of AI writing' },
    { pattern: /\b(cutting[\-\s]edge|state[\-\s]of[\-\s]the[\-\s]art|innovative|revolutionary|game[\-\s]changing)\b/gi, reason: 'Overuses marketing terminology' },
    { pattern: /\b(comprehensive|robust|scalable|efficient|modern)\b/gi, reason: 'Contains overused AI adjectives' }
  ];

  let aiPatternCount = 0;
  for (const { pattern, reason } of aiPatterns) {
    const matches = description.match(pattern) || [];
    if (matches.length >= 2) {
      aiPatternCount += 1;
      if (aiPatternCount > 0 && !reasons.includes(reason)) {
        reasons.push(reason);
      }
    }
  }

  // Check for perfect grammar (AI indicator - too perfect is suspicious)
  const grammarScore = checkGrammarPerfection(description);
  if (grammarScore > 0.95) {
    reasons.push('Unusually perfect grammar patterns');
  }

  // Check for consistent formatting and structure (AI indicator)
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length >= 3) {
    const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgLength > 25 && avgLength < 35) {
      reasons.push('Unusually consistent sentence length patterns');
    }
  }

  // Check for lack of personality or specificity
  if (!hasPersonalReferences(description)) {
    reasons.push('Lacks personal touches or specific examples');
  }

  // Check for repetitive structure
  const structurePattern = detectRepetitiveStructure(description);
  if (structurePattern > 0.8) {
    reasons.push('Contains repetitive sentence structures');
  }

  return {
    suspicious: reasons.length >= 2, // Need at least 2 indicators
    reasons
  };
}

/**
 * Calculate grammar perfection score (0-1)
 * Perfect grammar can be an AI indicator
 */
function checkGrammarPerfection(text: string): number {
  let score = 1;

  // Common informal markers that indicate human writing
  const informalMarkers = [
    /\b(like|um|uh|yeah|actually|basically|seriously|definitely|probably|maybe)\b/gi,
    /\b(don't|can't|won't|isn't|doesn't|haven't)\b/gi, // Contractions
    /[!]{2,}/, // Multiple exclamation marks
    /\.\.\./gi, // Ellipsis
  ];

  for (const pattern of informalMarkers) {
    if (pattern.test(text)) {
      score -= 0.15; // Deduct points for informal language
    }
  }

  // Check for common typos or variations (human indicator)
  if (/\b[a-z]{1,3}\b/gi.test(text)) {
    score -= 0.05; // Deduct for single letter words or abbreviations
  }

  return Math.max(0, score);
}

/**
 * Check if description has personal references (human indicator)
 */
function hasPersonalReferences(text: string): boolean {
  const personalPatterns = [
    /\b(i|me|we|our|my|my team)\b/i,
    /\b(learned|discovered|realized|found)\b/i,
    /\b(challenge|struggled|problem)\b/i,
    /specific\s+(example|case|instance)/i
  ];

  return personalPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect if text has overly repetitive sentence structure
 */
function detectRepetitiveStructure(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  if (sentences.length < 3) return 0;

  // Extract sentence patterns (first few words)
  const patterns = sentences.map(s => {
    const words = s.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
    return words;
  });

  // Count identical patterns
  const patternCounts: Record<string, number> = {};
  patterns.forEach(p => {
    patternCounts[p] = (patternCounts[p] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(patternCounts), 1);
  return maxCount / sentences.length; // Return ratio of most common pattern
}

/**
 * Analyze technologies claimed in project
 */
function analyzeTechnologies(technologies: string[]): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (technologies.length === 0) {
    reasons.push('No technologies listed');
    return { suspicious: true, reasons };
  }

  // Check for unrealistic tech stacks
  if (technologies.length > 15) {
    reasons.push('Claimed expertise in suspiciously many technologies');
  }

  // Check for mutually exclusive technologies
  const mutuallyExclusive = [
    { techs: ['PHP', 'ASP.NET'], reason: 'Mixed backend languages unusually' },
    { techs: ['React', 'Angular', 'Vue'], reason: 'Claimed expertise in multiple competing frameworks' }
  ];

  for (const { techs, reason } of mutuallyExclusive) {
    const count = techs.filter(t => technologies.some(tech => tech.toLowerCase().includes(t.toLowerCase()))).length;
    if (count >= techs.length) {
      reasons.push(reason);
    }
  }

  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Main portfolio project analysis function
 */
export async function analyzePortfolioProject(projectData: {
  title?: string;
  description?: string;
  technologies?: string[];
  clientFeedback?: string;
}): Promise<PortfolioAnalysisResult> {
  let riskScore = 0;
  const reasons: string[] = [];

  // Analyze description
  if (projectData.description) {
    const descAnalysis = analyzeProjectDescription(projectData.description);
    if (descAnalysis.suspicious) {
      reasons.push(...descAnalysis.reasons);
      riskScore += descAnalysis.reasons.length * 15;
    }
  }

  // Analyze technologies
  if (projectData.technologies && projectData.technologies.length > 0) {
    const techAnalysis = analyzeTechnologies(projectData.technologies);
    if (techAnalysis.suspicious) {
      reasons.push(...techAnalysis.reasons);
      riskScore += techAnalysis.reasons.length * 10;
    }
  }

  // Analyze client feedback
  if (projectData.clientFeedback) {
    const feedbackAnalysis = analyzeProjectDescription(projectData.clientFeedback);
    if (feedbackAnalysis.suspicious) {
      reasons.push(`Feedback: ${feedbackAnalysis.reasons[0]}`);
      riskScore += 20;
    }
  }

  // Check for suspicious title patterns
  if (projectData.title) {
    const titleAnalysis = analyzeTextContent(projectData.title);
    if (titleAnalysis.suspicious && titleAnalysis.reasons.length > 2) {
      reasons.push('Title contains suspicious patterns');
      riskScore += 15;
    }
  }

  riskScore = Math.min(riskScore, 100);

  return {
    isAiGenerated: riskScore >= 40, // 40+ score indicates likely AI generation
    riskScore,
    reasons: [...new Set(reasons)] // Remove duplicates
  };
}

