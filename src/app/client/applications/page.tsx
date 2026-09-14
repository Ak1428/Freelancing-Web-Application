'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Container, Card, Badge, Button } from '@/components/ui';

interface Application {
  id: string;
  jobId: string;
  job: {
    title: string;
    budget: number;
  };
  freelancer: {
    id: string;
    name: string;
    email: string;
  };
  coverLetter: string;
  proposedRate: number;
  status: string;
  createdAt: string;
}

export default function ClientApplicationsPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications?role=client');
        if (!res.ok) throw new Error('Failed to fetch applications');
        const data = await res.json();
        setApplications(data.applications || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-neutral-600">Loading applications...</p>
        </div>
      </Container>
    );
  }

  if (status !== 'authenticated') {
    return (
      <Container className="py-12">
        <Card className="max-w-md mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Applications</h1>
          <p className="text-neutral-600 mb-6">You need to log in to view applications.</p>
          <Link href="/login">
            <Button variant="primary" size="lg" fullWidth>
              Go to Login
            </Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">📨 Job Applications</h1>
            <p className="text-lg text-neutral-600">
              View and manage applications from freelancers for your posted jobs
            </p>
          </div>
          <Link href="/client/post-job">
            <Button variant="primary" size="lg">
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border border-red-200">
            <p className="text-red-700">⚠️ {error}</p>
          </Card>
        )}

        {/* Applications List */}
        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-4 gap-6 items-start">
                  {/* Freelancer Info */}
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Freelancer</p>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {application.freelancer.name}
                    </h3>
                    <p className="text-sm text-neutral-600">{application.freelancer.email}</p>
                  </div>

                  {/* Job Info */}
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Job</p>
                    <Link href={`/jobs/${application.jobId}`}>
                      <h3 className="text-lg font-semibold text-primary-600 hover:underline">
                        {application.job.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-neutral-600">
                      Budget: ${application.job.budget}
                    </p>
                  </div>

                  {/* Proposed Rate & Status */}
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">Proposed Rate</p>
                    {application.proposedRate ? (
                      <p className="text-2xl font-bold text-primary-600">
                        ${application.proposedRate}
                        <span className="text-sm text-neutral-600">/hr</span>
                      </p>
                    ) : (
                      <p className="text-neutral-500">Not specified</p>
                    )}
                    <div className="mt-3">
                      <Badge
                        variant={
                          application.status === 'ACCEPTED'
                            ? 'primary'
                            : application.status === 'REJECTED'
                              ? 'danger'
                              : 'accent'
                        }
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link href={`/freelancer/${application.freelancer.id}`}>
                      <Button variant="secondary" size="sm" fullWidth>
                        View Profile
                      </Button>
                    </Link>
                    <button className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                      Contact
                    </button>
                  </div>
                </div>

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="mt-4 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                    <p className="text-sm font-medium text-neutral-600 mb-2">Cover Letter</p>
                    <p className="text-neutral-700 text-sm line-clamp-3">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                {/* Application Date */}
                <div className="mt-4 text-xs text-neutral-500">
                  Applied on {new Date(application.createdAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No applications yet
            </h3>
            <p className="text-neutral-600 mb-6">
              When freelancers apply for your jobs, they will appear here.
            </p>
            <Link href="/client/post-job">
              <Button variant="primary" size="lg">
                Post Your First Job
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </Container>
  );
}
