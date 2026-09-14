-- CreateTable
CREATE TABLE "PortfolioProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT,
    "projectUrl" TEXT,
    "completionDate" DATETIME,
    "budget" REAL,
    "duration" TEXT,
    "clientFeedback" TEXT,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiDetectionScore" INTEGER NOT NULL DEFAULT 0,
    "aiDetectionReasons" TEXT NOT NULL DEFAULT '[]',
    "verificationStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioProject_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientMatchingPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "skillWeightage" REAL NOT NULL DEFAULT 0.5,
    "performanceWeightage" REAL NOT NULL DEFAULT 0.3,
    "responsivenessWeightage" REAL NOT NULL DEFAULT 0.2,
    "minimumRating" REAL NOT NULL DEFAULT 3.5,
    "minimumCompletedJobs" INTEGER NOT NULL DEFAULT 0,
    "preferredCategories" TEXT NOT NULL DEFAULT '[]',
    "excludeFlags" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientMatchingPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MatchingResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "matchScore" REAL NOT NULL,
    "skillSimilarity" REAL NOT NULL,
    "performanceScore" REAL NOT NULL,
    "responsiveness" REAL NOT NULL,
    "matchDetails" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MatchingResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MatchingResult_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FreelancerSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "suggestedFreelancers" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FreelancerSuggestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobSuggestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "freelancerId" TEXT NOT NULL,
    "suggestedJobs" TEXT NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobSuggestion_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientMatchingPreference_clientId_key" ON "ClientMatchingPreference"("clientId");
