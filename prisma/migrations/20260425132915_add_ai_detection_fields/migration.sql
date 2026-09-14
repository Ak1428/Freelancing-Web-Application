-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FreelancerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'TECHNICAL',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "portfolioUrl" TEXT,
    "bio" TEXT,
    "hourlyRate" REAL,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "detectionReasons" TEXT NOT NULL DEFAULT '[]',
    "flaggedFields" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "completedJobs" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    "responseTime" INTEGER NOT NULL DEFAULT 0,
    "lastScannedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FreelancerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FreelancerProfile" ("bio", "category", "completedJobs", "createdAt", "hourlyRate", "id", "isSuspicious", "portfolioUrl", "rating", "responseTime", "reviewCount", "skills", "totalEarnings", "updatedAt", "userId") SELECT "bio", "category", "completedJobs", "createdAt", "hourlyRate", "id", "isSuspicious", "portfolioUrl", "rating", "responseTime", "reviewCount", "skills", "totalEarnings", "updatedAt", "userId" FROM "FreelancerProfile";
DROP TABLE "FreelancerProfile";
ALTER TABLE "new_FreelancerProfile" RENAME TO "FreelancerProfile";
CREATE UNIQUE INDEX "FreelancerProfile_userId_key" ON "FreelancerProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
