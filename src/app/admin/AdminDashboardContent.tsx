'use client';

import { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';

interface Profile {
  id: string;
  userId: string;
  user: {
    name: string;
  };
  category: string;
  riskScore: number;
  detectionReasons: string;
}

interface AdminDashboardContentProps {
  initialProfiles: Profile[];
}

export default function AdminDashboardContent({ initialProfiles }: AdminDashboardContentProps) {
  const [flaggedProfiles, setFlaggedProfiles] = useState(initialProfiles);

  const handleScanComplete = async () => {
    // Reload flagged profiles after scan
    try {
      const res = await fetch('/api/admin/scan-profiles', {
        method: 'GET'
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedProfiles(data.profiles || []);
      }
    } catch (err) {
      console.error('Failed to reload profiles:', err);
    }
  };

  return (
    <>
      <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">🤖 AI Profile Scanning</h2>
        <p className="text-blue-800 mb-4">
          Run the AI detection system to scan all freelancer profiles and identify suspicious accounts.
        </p>
        <div style={{ width: 'fit-content' }}>
          <div onClick={() => handleScanComplete()}>
            <ScanProfilesButton onScanComplete={handleScanComplete} />
          </div>
        </div>
      </div>

      {flaggedProfiles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Risk Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Detection Reasons
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {flaggedProfiles.map((profile) => {
                let reasons: string[] = [];
                try {
                  reasons = typeof profile.detectionReasons === 'string' 
                    ? JSON.parse(profile.detectionReasons) 
                    : [];
                } catch {
                  reasons = [];
                }
                
                const getRiskColor = (score: number) => {
                  if (score >= 70) return 'bg-red-100 text-red-800';
                  if (score >= 50) return 'bg-orange-100 text-orange-800';
                  return 'bg-yellow-100 text-yellow-800';
                };

                return (
                  <tr key={profile.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      {profile.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="primary">{profile.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(profile.riskScore)}`}>
                        {profile.riskScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        {reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                            • {reason}
                          </div>
                        ))}
                        {reasons.length > 2 && (
                          <div className="text-xs text-neutral-500 italic">
                            +{reasons.length - 2} more
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="danger">⚠️ Flagged</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 px-6">
          <div className="text-5xl mb-4">✓</div>
          <h3 className="text-xl font-semibold text-neutral-900">
            Platform is Secure
          </h3>
          <p className="text-neutral-600 mt-2">
            No profiles currently require manual review. Run a scan to check for suspicious activity.
          </p>
        </div>
      )}
    </>
  );
}
