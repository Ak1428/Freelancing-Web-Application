'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, Container, Card } from '@/components/ui';
import { Suspense, useEffect, useState } from 'react';

function HomeContent() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During hydration, show loading state
  if (!mounted) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl">⏳</div>
          <p className="text-lg text-neutral-600">Loading...</p>
        </div>
      </Container>
    );
  }

  if (status === 'loading') {
    return (
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl">⏳</div>
          <p className="text-lg text-neutral-600">Loading...</p>
        </div>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container className="py-12">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900">
              Welcome to <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">TalentFlow</span>
            </h1>
            <p className="text-xl text-neutral-600">
              The AI-secured marketplace connecting top-tier talent with visionary clients worldwide. Get started today.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/login">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
            <span className="text-9xl">💼</span>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {[
            { icon: '🔍', title: 'Find Perfect Matches', desc: 'AI-powered matching connects you with the right talent or projects instantly.' },
            { icon: '💰', title: 'Secure Payments', desc: 'Protected transactions with escrow services and milestone-based payments.' },
            { icon: '🛡️', title: 'AI Security', desc: 'Advanced fraud detection keeps the platform safe and trustworthy.' },
            { icon: '⚡', title: 'Fast & Reliable', desc: 'Streamlined processes get your projects done quickly and efficiently.' },
          ].map((feature, i) => (
            <Card key={i} className="p-6 text-center hover:shadow-lg">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-neutral-600">{feature.desc}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-12 text-center bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-3xl font-bold text-neutral-900 mb-3">Ready to get started?</h2>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Join thousands of freelancers and clients transforming how work gets done online.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button variant="primary" size="lg">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  // Authenticated Dashboard
  return (
    <Container className="py-12">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-6 space-y-4 sticky top-20">
            {/* Profile Box */}
            <div className="flex gap-3 items-center p-4 rounded-lg bg-primary-50">
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                {(session.user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-neutral-900">{session.user?.name || 'User'}</div>
                <div className="text-xs text-neutral-600">
                  {(session.user as any)?.role === 'CLIENT' ? 'Client' : 'Freelancer'}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link href="/jobs" className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">📌 Browse Jobs</Link>
              <Link href="/freelancers" className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">👥 Freelancers</Link>
              {(session.user as any)?.role === 'CLIENT' && (
                <Link href="/client/post-job" className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">✏️ Post Job</Link>
              )}
              <Link href="/messages" className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">💬 Messages</Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin" className="block px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors">🛡️ Admin</Link>
              )}
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back, {session.user?.name}! 👋
            </h1>
            <p className="text-neutral-600 mb-6">
              {(session.user as any)?.role === 'CLIENT'
                ? 'Ready to post a new job or check your projects?'
                : 'Ready to find new opportunities or update your profile?'}
            </p>
            <div className="flex gap-4 flex-wrap">
              {(session.user as any)?.role === 'CLIENT' ? (
                <>
                  <Link href="/client/post-job">
                    <Button variant="primary">Post a Job</Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="secondary">Browse Jobs</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/freelancer/profile">
                    <Button variant="primary">Update Profile</Button>
                  </Link>
                  <Link href="/jobs">
                    <Button variant="secondary">Find Jobs</Button>
                  </Link>
                </>
              )}
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Active Projects', value: '12', icon: '📊' },
              { label: 'Messages', value: '5', icon: '💬' },
              { label: 'Profile Views', value: '237', icon: '👁️' },
            ].map((stat, i) => (
              <Card key={i} className="p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
                <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <Container className="py-12">
        <div className="text-center">
          <div className="text-3xl">⏳</div>
          <p className="text-lg text-neutral-600">Loading...</p>
        </div>
      </Container>
    }>
      <HomeContent />
    </Suspense>
  );
}
