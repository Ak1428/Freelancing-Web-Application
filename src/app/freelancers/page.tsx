'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Container, Card, Badge, Button } from '@/components/ui';
import FlaggedProfileBadge from '@/components/FlaggedProfileBadge';

export default function FreelancerList() {
  const { data: session } = useSession();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/freelancers');
        if (!res.ok) throw new Error('Failed to fetch freelancers');
        const data = await res.json();
        setFreelancers(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Container className="py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Browse Freelancers</h1>
            <p className="text-lg text-neutral-600">Find technical and non-technical talent ready to work</p>
          </div>
          {session?.user ? (
            (session.user as any).role === 'CLIENT' ? (
              <Link href="/client/post-job">
                <Button variant="primary" size="lg">Post a Job</Button>
              </Link>
            ) : (
              <Link href="/freelancer/profile">
                <Button variant="primary" size="lg">Update Profile</Button>
              </Link>
            )
          ) : (
            <Link href="/login">
              <Button variant="primary" size="lg">Login to Hire</Button>
            </Link>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-neutral-600">Loading freelancers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            Error: {error}
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && !error && (
          <>
            {freelancers.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancers.map((freelancer) => (
                  <Card key={freelancer.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      {/* Flagged Badge */}
                      {freelancer.isSuspicious && (
                        <div className="mb-2">
                          <FlaggedProfileBadge 
                            isSuspicious={freelancer.isSuspicious}
                            riskScore={freelancer.riskScore}
                          />
                        </div>
                      )}

                      {/* Header */}
                      <div>
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {freelancer.user?.name || 'Unknown'}
                        </h3>
                        <Badge 
                          variant={freelancer.category === 'TECHNICAL' ? 'primary' : 'accent'}
                          className="mt-2"
                        >
                          {freelancer.category === 'TECHNICAL' ? '💻 Technical' : '🎨 Non-Technical'}
                        </Badge>
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-sm font-medium text-neutral-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(freelancer.skills || '[]')
                            .slice(0, 3)
                            .map((skill: string) => (
                              <Badge key={skill} variant="primary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          {JSON.parse(freelancer.skills || '[]').length > 3 && (
                            <Badge variant="accent" className="text-xs">
                              +{JSON.parse(freelancer.skills || '[]').length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {freelancer.bio && (
                        <p className="text-sm text-neutral-600 line-clamp-2">
                          {freelancer.bio}
                        </p>
                      )}

                      {/* Rate */}
                      <div className="py-3 border-t border-neutral-200">
                        {freelancer.hourlyRate ? (
                          <p className="text-lg font-bold text-primary-600">
                            ${freelancer.hourlyRate}/hr
                          </p>
                        ) : (
                          <p className="text-sm text-neutral-500">Rate not specified</p>
                        )}
                      </div>

                      {/* Portfolio & CTA */}
                      <div className="flex gap-2">
                        {freelancer.portfolioUrl && (
                          <a
                            href={freelancer.portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" fullWidth>
                              Portfolio
                            </Button>
                          </a>
                        )}
                        <Link href={`/freelancer/${freelancer.user?.id || freelancer.userId}`} className="flex-1">
                          <Button variant="primary" size="sm" fullWidth>
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-lg text-neutral-600">No freelancers found</p>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
