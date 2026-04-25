'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface ScanProfilesButtonProps {
  onScanComplete?: () => void;
}

export default function ScanProfilesButton({ onScanComplete }: ScanProfilesButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/scan-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        throw new Error(`Scan failed: ${res.statusText}`);
      }

      const data = await res.json();
      setResult(data);
      onScanComplete?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleScan} 
        disabled={loading}
        variant="primary"
      >
        {loading ? '🔍 Scanning...' : '🔍 Scan All Profiles'}
      </Button>

      {result && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Scan Results</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>✓ Scanned: <strong>{result.scannedCount}</strong> profiles</p>
            <p>⚠️ Flagged: <strong>{result.suspiciousCount}</strong> suspicious profiles</p>
            {result.flaggedProfiles?.length > 0 && (
              <div className="mt-3 p-2 bg-white rounded border border-blue-100">
                <p className="font-medium mb-2">Recently Flagged:</p>
                <ul className="space-y-1">
                  {result.flaggedProfiles.slice(0, 5).map((profile: any) => (
                    <li key={profile.profileId} className="text-xs">
                      • {profile.userName} ({profile.riskScore}% risk)
                    </li>
                  ))}
                </ul>
                {result.flaggedProfiles.length > 5 && (
                  <p className="text-xs text-gray-500 mt-1">
                    +{result.flaggedProfiles.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
    </div>
  );
}
