'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container, Card, Badge, Button } from '@/components/ui';

export default function JobsBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) throw new Error('Cannot fetch jobs');
        const data = await res.json();
        setJobs(data.jobs || []);
      } catch (error) {
        setError((error as Error).message);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const filteredJobs = (jobs || []).filter(job => 
    (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (JSON.parse(job.requiredSkills || '[]') as string[]).some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-neutral-900">Available Jobs</h1>
          <p className="text-lg text-neutral-600">Browse and apply for projects that match your skills</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or skill (e.g. React, SEO)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
            <span className="absolute left-4 top-3 text-xl">🔍</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-neutral-600">Loading jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && !error && (
          <>
            {filteredJobs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-900 mb-2">{job.title}</h2>
                        <p className="text-2xl font-bold text-primary-600">${job.budget}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(job.requiredSkills || '[]').slice(0, 3).map((skill: string) => (
                          <Badge key={skill} variant="primary">{skill}</Badge>
                        ))}
                        {JSON.parse(job.requiredSkills || '[]').length > 3 && (
                          <Badge variant="accent">+{JSON.parse(job.requiredSkills || '[]').length - 3} more</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                        <span className="text-sm text-neutral-500">
                          📅 {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="primary" size="sm">View & Apply</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-lg text-neutral-600">No jobs found matching "{searchTerm}"</p>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
