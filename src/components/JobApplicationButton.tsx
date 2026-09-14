'use client';

import { useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';

interface JobApplicationButtonProps {
  jobId: string;
  jobTitle: string;
}

export default function JobApplicationButton({ jobId, jobTitle }: JobApplicationButtonProps) {
  // Validate jobId
  if (!jobId || typeof jobId !== 'string') {
    console.error('Invalid jobId prop:', jobId);
    return (
      <Button variant="secondary" size="lg" fullWidth disabled>
        Invalid Job ID
      </Button>
    );
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('Submitting application with jobId:', jobId, { coverLetter, proposedRate });

    try {
      const payload = {
        jobId,
        coverLetter: coverLetter || null,
        proposedRate: proposedRate ? parseFloat(proposedRate) : null,
      };
      
      console.log('Sending payload:', payload);

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', { ok: response.ok, status: response.status, data });

      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply for job');
      }

      setSuccess(true);
      setCoverLetter('');
      setProposedRate('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="primary" size="lg" fullWidth onClick={() => setIsOpen(true)}>
        💼 Apply for this job
      </Button>
    );
  }

  return (
    <Card className="p-6 border-2 border-primary-600">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Apply for Job</h3>
        <p className="text-sm text-neutral-600">{jobTitle}</p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-green-700 text-sm">
          ✓ Application submitted successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            Cover Letter (Optional)
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the client why you're a good fit for this job..."
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
            rows={4}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            Proposed Rate (Optional)
          </label>
          <div className="flex items-center gap-2">
            <span className="text-neutral-600">$</span>
            <input
              type="number"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              placeholder="Your proposed rate"
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
              step="0.01"
              min="0"
              disabled={isLoading}
            />
            <span className="text-neutral-600">/hr</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? '⏳ Submitting...' : '✓ Submit Application'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              setIsOpen(false);
              setError(null);
              setCoverLetter('');
              setProposedRate('');
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
